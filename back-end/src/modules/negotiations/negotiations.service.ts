import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Negotiation, NegotiationDocument } from './schemas/negotiation.schema.js';
import { CreateNegotiationDto, CounterNegotiationDto, RejectNegotiationDto } from './dto/create-negotiation.dto.js';
import { NegotiationResponseDto } from './dto/negotiation-response.dto.js';
import { NegotiationFilterDto } from './dto/negotiation-filter.dto.js';
import { NegotiationStatus } from '../../shared/enums/negotiation.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { UserType } from '../users/schemas/user.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { PurchasesService } from '../purchases/purchases.service.js';
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
  sellerId?: Types.ObjectId | null;
  adminId?: Types.ObjectId | null;
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return !!ref && typeof ref === 'object' && '_id' in (ref as object);
}

@Injectable()
export class NegotiationsService implements OnModuleInit {
  private readonly logger = new Logger(NegotiationsService.name);

  constructor(
    @InjectModel(Negotiation.name) private readonly negotiationModel: Model<NegotiationDocument>,
    private readonly propertiesService: PropertiesService,
    private readonly purchasesService: PurchasesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await backfillObjectIdStrings(this.negotiationModel, ['propertyId', 'buyerId'], this.logger);
  }

  /**
   * `actor` is optional and, when passed, adds `canRespond` — whether this
   * caller may counter/accept/reject the negotiation (mirrors
   * assertCanRespond). Only ever true for the seller who owns the
   * property: the price is the seller's call alone, so the admin oversight
   * queue is strictly read-only (see assertCanRespond).
   */
  private toResponse(n: NegotiationDocument, actor?: AuthenticatedUser): NegotiationResponseDto {
    const property = n.propertyId as unknown;
    const buyer = n.buyerId as unknown;
    const propertyPopulated = isPopulated(property);
    const buyerPopulated = isPopulated(buyer);

    let canRespond: boolean | undefined;
    let propertyHasSeller: boolean | undefined;
    if (actor && propertyPopulated) {
      const sellerId = referenceId((property as PopulatedRef).sellerId);
      // No admin/superuser branch on purpose — nobody but the owning seller
      // may move the price. A listing with no seller therefore has no
      // responder at all, and `canRespond` is false for everyone.
      canRespond = !!sellerId && actor.userType === UserType.SELLER && actor.id === sellerId;
      propertyHasSeller = !!sellerId;
    }

    return {
      id: n._id.toString(),
      propertyId: referenceId(property),
      buyerId: referenceId(buyer),
      offerAmount: n.offerAmount,
      counterAmount: n.counterAmount ?? null,
      message: n.message ?? null,
      paymentMode: n.paymentMode ?? null,
      status: n.status,
      rejectionReason: n.rejectionReason ?? null,
      ...(canRespond !== undefined && { canRespond }),
      ...(propertyHasSeller !== undefined && { propertyHasSeller }),
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
      createdAt: istTimestamp(n.createdAt ?? new Date()),
      updatedAt: istTimestamp(n.updatedAt ?? new Date()),
    };
  }

  private assertValidId(id: string, label = 'negotiation'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid ${label} ID`);
    }
  }

  private async loadOrThrow(id: string): Promise<NegotiationDocument> {
    this.assertValidId(id);
    const negotiation = await this.negotiationModel.findById(id);
    if (!negotiation) {
      throw new NotFoundException(`Negotiation with ID "${id}" not found`);
    }
    return negotiation;
  }

  private assertOwnsOrElevated(negotiation: NegotiationDocument, actor: AuthenticatedUser): void {
    if (actor.role === Role.ADMIN || actor.role === Role.SUPERUSER) return;
    if (referenceId(negotiation.buyerId) === actor.id) return;
    throw new ForbiddenException('You do not have permission to access this negotiation');
  }

  /**
   * Read access: the buyer who made the offer, any admin/superuser, or the
   * seller who owns the property (they are the counterparty — they must be
   * able to read the negotiation they are expected to respond to).
   */
  private async assertCanView(negotiation: NegotiationDocument, actor: AuthenticatedUser): Promise<void> {
    if (actor.role === Role.ADMIN || actor.role === Role.SUPERUSER) return;
    if (referenceId(negotiation.buyerId) === actor.id) return;
    if (actor.userType === UserType.SELLER) {
      const propertyId = referenceId(negotiation.propertyId);
      if (propertyId) {
        const { sellerId } = await this.propertiesService.getOwnershipInfo(propertyId);
        if (sellerId && sellerId === actor.id) return;
      }
    }
    throw new ForbiddenException('You do not have permission to access this negotiation');
  }

  /**
   * ONLY the seller who submitted the property may counter/accept/reject a
   * negotiation on it — not an admin, not a superuser. The price is the
   * seller's to agree, and an admin accepting on their behalf would commit
   * the seller to a number they never saw. The admin's role in a deal
   * starts *after* acceptance: the buyer initiates the purchase and the
   * admin drives each deal step (see PurchasesService.advance).
   *
   * A listing with no seller (one an admin created directly) consequently
   * has nobody who can answer an offer; the admin review queue flags those
   * explicitly so they can be given a seller rather than sitting silently
   * unanswerable.
   */
  /**
   * Refuses to turn an offer into a purchase when the property has already
   * been sold or rented out. Offers made before the sale stay sitting in the
   * seller's queue as PENDING, and accepting one would mint a second purchase
   * for a property that is no longer theirs to sell.
   */
  private async assertStillOnTheMarket(negotiation: NegotiationDocument): Promise<void> {
    const propertyId = referenceId(negotiation.propertyId);
    if (!propertyId) {
      throw new NotFoundException('The property for this negotiation no longer exists');
    }
    if (await this.propertiesService.isDealClosed(propertyId)) {
      throw new BadRequestException(
        'This property has already been sold or rented out, so this offer can no longer be accepted.',
      );
    }
  }

  private async assertCanRespond(negotiation: NegotiationDocument, actor: AuthenticatedUser): Promise<void> {
    const propertyId = referenceId(negotiation.propertyId);
    if (!propertyId) {
      throw new NotFoundException('The property for this negotiation no longer exists');
    }
    const { sellerId } = await this.propertiesService.getOwnershipInfo(propertyId);
    if (sellerId && actor.userType === UserType.SELLER && actor.id === sellerId) return;
    throw new ForbiddenException(
      'Only the seller who listed this property can respond to an offer on it. ' +
        'Admins do not negotiate price — they take over once the seller accepts.',
    );
  }

  /** Buyers only — submits an offer on a property. */
  async create(dto: CreateNegotiationDto, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    if (actor.userType !== UserType.BUYER) {
      throw new ForbiddenException('Only buyer accounts can submit offers');
    }
    // Throws NotFoundException if the property doesn't exist.
    const property = await this.propertiesService.findOne(dto.propertyId);
    // Hiding a sold listing from search is not enough on its own: a buyer who
    // still has the page open (or the id) could otherwise offer on a property
    // somebody else has already bought.
    if (await this.propertiesService.isDealClosed(dto.propertyId)) {
      throw new BadRequestException(
        `"${property.title}" is no longer on the market — it has already been ${property.status}.`,
      );
    }

    const negotiation = await this.negotiationModel.create({
      propertyId: dto.propertyId,
      buyerId: actor.id,
      offerAmount: dto.offerAmount,
      message: dto.message ?? null,
      paymentMode: dto.paymentMode ?? null,
      status: NegotiationStatus.PENDING,
    });
    return this.toResponse(negotiation);
  }

  async findByOwner(buyerId: string): Promise<NegotiationResponseDto[]> {
    this.assertValidId(buyerId, 'user');
    const negotiations = await this.negotiationModel
      .find({ buyerId })
      .populate('propertyId', 'title city state images')
      .sort({ createdAt: -1 });
    return negotiations.map((n) => this.toResponse(n));
  }

  /**
   * Admin/superuser oversight queue, scoped by propertyIdsForAdmin to the
   * admin's own city — a buyer negotiating on a Kochi listing shows up on
   * the Kochi desk only. Read-only either way: price is strictly between
   * buyer and the owning seller (see assertCanRespond), so the admin watches
   * rather than acts. The superuser sees all four cities.
   */
  async findForReview(filters: NegotiationFilterDto, actor: AuthenticatedUser): Promise<PaginatedResult<NegotiationResponseDto>> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
    if (propertyIds) query.propertyId = { $in: propertyIds };

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.negotiationModel
        .find(query)
        .populate('propertyId', 'title city state images sellerId adminId')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.negotiationModel.countDocuments(query),
    ]);

    return {
      items: items.map((n) => this.toResponse(n, actor)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  /** Seller only — every negotiation on a property this seller submitted. */
  async findForSeller(actor: AuthenticatedUser, filters: NegotiationFilterDto): Promise<PaginatedResult<NegotiationResponseDto>> {
    if (actor.userType !== UserType.SELLER) {
      throw new ForbiddenException('Only seller accounts have a negotiation queue');
    }
    const propertyIds = await this.propertiesService.propertyIdsForSeller(actor.id);
    const query: Record<string, unknown> = { propertyId: { $in: propertyIds } };
    if (filters.status) query.status = filters.status;

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.negotiationModel
        .find(query)
        .populate('propertyId', 'title city state images')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.negotiationModel.countDocuments(query),
    ]);

    return {
      items: items.map((n) => this.toResponse(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async findOne(id: string, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    await this.assertCanView(negotiation, actor);
    await negotiation.populate([
      { path: 'propertyId', select: 'title city state images' },
      { path: 'buyerId', select: 'name email' },
    ]);
    return this.toResponse(negotiation);
  }

  /** Seller (property owner) only — see assertCanRespond. */
  async counter(id: string, dto: CounterNegotiationDto, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    await this.assertCanRespond(negotiation, actor);
    if (![NegotiationStatus.PENDING, NegotiationStatus.COUNTERED].includes(negotiation.status)) {
      throw new BadRequestException(`Cannot counter a negotiation that is ${negotiation.status}`);
    }
    negotiation.counterAmount = dto.counterAmount;
    negotiation.status = NegotiationStatus.COUNTERED;
    await negotiation.save();
    return this.toResponse(negotiation);
  }

  /** Seller (property owner) only — accepts the buyer's current offer as-is. See assertCanRespond. */
  async acceptOffer(id: string, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    await this.assertCanRespond(negotiation, actor);
    await this.assertStillOnTheMarket(negotiation);
    if (negotiation.status !== NegotiationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept a negotiation that is ${negotiation.status}. Counter or reject instead, or wait for the buyer to accept the counter.`,
      );
    }
    negotiation.status = NegotiationStatus.ACCEPTED;
    await negotiation.save();
    await this.purchasesService.createFromNegotiation(negotiation, negotiation.offerAmount);
    return this.toResponse(negotiation);
  }

  /** Seller (property owner) only. See assertCanRespond. */
  async reject(id: string, dto: RejectNegotiationDto, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    await this.assertCanRespond(negotiation, actor);
    if (![NegotiationStatus.PENDING, NegotiationStatus.COUNTERED].includes(negotiation.status)) {
      throw new BadRequestException(`Cannot reject a negotiation that is already ${negotiation.status}`);
    }
    negotiation.status = NegotiationStatus.REJECTED;
    negotiation.rejectionReason = dto.reason ?? null;
    await negotiation.save();
    return this.toResponse(negotiation);
  }

  /** Buyer (owner) only — accepts the seller's counter-offer. */
  async acceptCounterByBuyer(id: string, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    this.assertOwnsOrElevated(negotiation, actor);
    await this.assertStillOnTheMarket(negotiation);
    if (negotiation.status !== NegotiationStatus.COUNTERED || negotiation.counterAmount == null) {
      throw new BadRequestException('There is no counter-offer to accept on this negotiation');
    }
    negotiation.status = NegotiationStatus.ACCEPTED;
    await negotiation.save();
    await this.purchasesService.createFromNegotiation(negotiation, negotiation.counterAmount);
    return this.toResponse(negotiation);
  }

  /** Buyer (owner) only. */
  async withdraw(id: string, actor: AuthenticatedUser): Promise<NegotiationResponseDto> {
    const negotiation = await this.loadOrThrow(id);
    this.assertOwnsOrElevated(negotiation, actor);
    if (![NegotiationStatus.PENDING, NegotiationStatus.COUNTERED].includes(negotiation.status)) {
      throw new BadRequestException(`Cannot withdraw a negotiation that is already ${negotiation.status}`);
    }
    negotiation.status = NegotiationStatus.WITHDRAWN;
    await negotiation.save();
    return this.toResponse(negotiation);
  }
}
