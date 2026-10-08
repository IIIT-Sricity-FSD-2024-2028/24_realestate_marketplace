import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit, VisitDocument } from './schemas/visit.schema.js';
import { CreateVisitDto, RescheduleVisitDto, CancelVisitDto } from './dto/create-visit.dto.js';
import { VisitResponseDto } from './dto/visit-response.dto.js';
import { VisitFilterDto } from './dto/visit-filter.dto.js';
import { VisitStatus } from '../../shared/enums/visit.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserType } from '../users/schemas/user.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { backfillObjectIdStrings } from '../../shared/helpers/objectid-backfill.helper.js';
import { referenceId } from '../../shared/helpers/reference-id.helper.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import type { PaginatedResult } from '../properties/properties.service.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

interface PopulatedRef {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  title?: string;
  city?: string;
  state?: string;
  images?: string[];
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return !!ref && typeof ref === 'object' && '_id' in (ref as object);
}

@Injectable()
export class VisitsService implements OnModuleInit {
  private readonly logger = new Logger(VisitsService.name);

  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>,
    private readonly propertiesService: PropertiesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await backfillObjectIdStrings(this.visitModel, ['propertyId', 'buyerId'], this.logger);
  }

  private toResponse(v: VisitDocument): VisitResponseDto {
    const property = v.propertyId as unknown;
    const buyer = v.buyerId as unknown;
    const propertyPopulated = isPopulated(property);
    const buyerPopulated = isPopulated(buyer);

    return {
      id: v._id.toString(),
      propertyId: referenceId(property),
      buyerId: referenceId(buyer),
      requestedDate: v.requestedDate,
      requestedSlot: v.requestedSlot,
      message: v.message ?? null,
      status: v.status,
      cancelReason: v.cancelReason ?? null,
      ...(propertyPopulated && {
        propertyTitle: (property as PopulatedRef).title,
        propertyCity: (property as PopulatedRef).city,
        propertyState: (property as PopulatedRef).state,
        propertyImage: (property as PopulatedRef).images?.[0] ?? null,
      }),
      ...(buyerPopulated && {
        buyerName: (buyer as PopulatedRef).name,
        buyerEmail: (buyer as PopulatedRef).email,
      }),
      createdAt: istTimestamp(v.createdAt ?? new Date()),
      updatedAt: istTimestamp(v.updatedAt ?? new Date()),
    };
  }

  private assertValidId(id: string, label = 'visit'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid ${label} ID`);
    }
  }

  private async loadOrThrow(id: string): Promise<VisitDocument> {
    this.assertValidId(id);
    const visit = await this.visitModel.findById(id);
    if (!visit) {
      throw new NotFoundException(`Visit with ID "${id}" not found`);
    }
    return visit;
  }

  private assertOwnsOrElevated(visit: VisitDocument, actor: AuthenticatedUser): void {
    if (actor.role === Role.SUPERUSER) return;
    if (referenceId(visit.buyerId) === actor.id) return;
    throw new ForbiddenException('You do not have permission to access this visit');
  }

  /**
   * Site visits are strictly buyer ↔ admin, and the admin is the one who
   * runs the property's city: a visit to a Hyderabad flat is confirmed,
   * rescheduled, completed or cancelled by the Hyderabad admin (or the
   * superuser) and by nobody else. The seller has no role here at all.
   */
  private async assertCanManage(visit: VisitDocument, actor: AuthenticatedUser): Promise<void> {
    if (actor.role !== Role.ADMIN && actor.role !== Role.SUPERUSER) {
      throw new ForbiddenException('Only an admin or superuser may manage this visit');
    }
    await this.propertiesService.assertAdminHandlesProperty(referenceId(visit.propertyId), actor);
  }

  /** Buyers only — requests a site visit on a property. */
  async create(dto: CreateVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    if (actor.userType !== UserType.BUYER) {
      throw new ForbiddenException('Only buyer accounts can request a site visit');
    }
    // Throws NotFoundException if the property doesn't exist.
    await this.propertiesService.findOne(dto.propertyId);

    const visit = await this.visitModel.create({
      propertyId: dto.propertyId,
      buyerId: actor.id,
      requestedDate: dto.requestedDate,
      requestedSlot: dto.requestedSlot,
      message: dto.message ?? null,
      status: VisitStatus.PENDING,
    });
    return this.toResponse(visit);
  }

  async findByOwner(buyerId: string): Promise<VisitResponseDto[]> {
    this.assertValidId(buyerId, 'user');
    const visits = await this.visitModel
      .find({ buyerId })
      .populate('propertyId', 'title city state images')
      .sort({ createdAt: -1 });
    return visits.map((v) => this.toResponse(v));
  }

  /**
   * Admin/superuser queue, scoped by propertyIdsForAdmin to the admin's own
   * city — a buyer requesting a visit in Chennai reaches the Chennai desk
   * only. Every visit here is one this admin may act on: visits are never
   * routed to a seller, so unlike negotiations there's no view-only subset.
   */
  async findForReview(actor: AuthenticatedUser, filters: VisitFilterDto): Promise<PaginatedResult<VisitResponseDto>> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
    if (propertyIds) query.propertyId = { $in: propertyIds };

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.visitModel
        .find(query)
        .populate('propertyId', 'title city state images')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.visitModel.countDocuments(query),
    ]);

    return {
      items: items.map((v) => this.toResponse(v)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  /** The property's city admin (or the superuser) confirms a pending visit request. */
  async confirm(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    const visit = await this.loadOrThrow(id);
    await this.assertCanManage(visit, actor);
    if (![VisitStatus.PENDING, VisitStatus.RESCHEDULED].includes(visit.status)) {
      throw new BadRequestException(`Cannot confirm a visit that is ${visit.status}`);
    }
    visit.status = VisitStatus.CONFIRMED;
    await visit.save();
    return this.toResponse(visit);
  }

  /** The property's city admin only — proposes a new date/slot. */
  async reschedule(id: string, dto: RescheduleVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    const visit = await this.loadOrThrow(id);
    await this.assertCanManage(visit, actor);
    if (![VisitStatus.PENDING, VisitStatus.CONFIRMED, VisitStatus.RESCHEDULED].includes(visit.status)) {
      throw new BadRequestException(`Cannot reschedule a visit that is ${visit.status}`);
    }
    visit.requestedDate = dto.requestedDate;
    visit.requestedSlot = dto.requestedSlot;
    visit.status = VisitStatus.RESCHEDULED;
    await visit.save();
    return this.toResponse(visit);
  }

  /** The property's city admin only — marks a confirmed visit as completed. */
  async complete(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    const visit = await this.loadOrThrow(id);
    await this.assertCanManage(visit, actor);
    if (![VisitStatus.CONFIRMED, VisitStatus.RESCHEDULED].includes(visit.status)) {
      throw new BadRequestException(`Cannot complete a visit that is ${visit.status}`);
    }
    visit.status = VisitStatus.COMPLETED;
    await visit.save();
    return this.toResponse(visit);
  }

  /** Buyer (owner), or the property's city admin, may cancel. */
  async cancel(id: string, dto: CancelVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    const visit = await this.loadOrThrow(id);
    if (referenceId(visit.buyerId) !== actor.id) {
      await this.assertCanManage(visit, actor);
    }
    if ([VisitStatus.COMPLETED, VisitStatus.CANCELLED].includes(visit.status)) {
      throw new BadRequestException(`Cannot cancel a visit that is already ${visit.status}`);
    }
    visit.status = VisitStatus.CANCELLED;
    visit.cancelReason = dto.reason ?? null;
    await visit.save();
    return this.toResponse(visit);
  }

  /** Buyer/superuser detail lookup. */
  async findOne(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto> {
    const visit = await this.loadOrThrow(id);
    this.assertOwnsOrElevated(visit, actor);
    await visit.populate([
      { path: 'propertyId', select: 'title city state images' },
      { path: 'buyerId', select: 'name email' },
    ]);
    return this.toResponse(visit);
  }
}
