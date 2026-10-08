import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema.js';
import { PurchaseResponseDto } from './dto/purchase-response.dto.js';
import { PurchaseFilterDto } from './dto/purchase-filter.dto.js';
import { DealStatus, DEAL_STEPS } from '../../shared/enums/purchase.enum.js';
import { ListingType } from '../../shared/enums/property.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import type { NegotiationDocument } from '../negotiations/schemas/negotiation.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';
import type { PaginatedResult } from '../properties/properties.service.js';
import { UserType } from '../users/schemas/user.schema.js';
import { backfillObjectIdStrings } from '../../shared/helpers/objectid-backfill.helper.js';
import { referenceId } from '../../shared/helpers/reference-id.helper.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

function isElevated(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPERUSER;
}

interface PopulatedRef {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  title?: string;
  city?: string;
  state?: string;
  images?: string[];
  listingType?: ListingType;
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return !!ref && typeof ref === 'object' && '_id' in (ref as object);
}

@Injectable()
export class PurchasesService implements OnModuleInit {
  private readonly logger = new Logger(PurchasesService.name);

  constructor(
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
    private readonly propertiesService: PropertiesService,
    private readonly commissionsService: CommissionsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await backfillObjectIdStrings(this.purchaseModel, ['propertyId', 'buyerId', 'negotiationId'], this.logger);
  }

  private toResponse(p: PurchaseDocument): PurchaseResponseDto {
    const property = p.propertyId as unknown;
    const buyer = p.buyerId as unknown;
    const propertyPopulated = isPopulated(property);
    const buyerPopulated = isPopulated(buyer);

    return {
      id: p._id.toString(),
      propertyId: referenceId(property),
      buyerId: referenceId(buyer),
      negotiationId: referenceId(p.negotiationId),
      agreedPrice: p.agreedPrice,
      dealStep: p.dealStep,
      dealStepLabel: DEAL_STEPS[p.dealStep - 1] ?? DEAL_STEPS[0],
      dealStatus: p.dealStatus,
      ...(propertyPopulated && {
        propertyTitle: (property as PopulatedRef).title,
        propertyCity: (property as PopulatedRef).city,
        propertyState: (property as PopulatedRef).state,
        propertyImage: (property as PopulatedRef).images?.[0] ?? null,
        propertyListingType: (property as PopulatedRef).listingType,
      }),
      ...(buyerPopulated && {
        buyerName: (buyer as PopulatedRef).name,
        buyerEmail: (buyer as PopulatedRef).email,
      }),
      createdAt: istTimestamp(p.createdAt ?? new Date()),
      updatedAt: istTimestamp(p.updatedAt ?? new Date()),
    };
  }

  /**
   * A single purchase plus its commission state.
   *
   * Purchase tracking is exactly where a buyer expects to be told what they
   * owe, so the invoice travels with the deal rather than living only on a
   * separate billing page they might never open.
   */
  private async decorate(p: PurchaseDocument): Promise<PurchaseResponseDto> {
    const [enriched] = await this.withCommissions([p]);
    return enriched;
  }

  /** The list-shaped version: one commission query for the whole page. */
  private async withCommissions(purchases: PurchaseDocument[]): Promise<PurchaseResponseDto[]> {
    const responses = purchases.map((p) => this.toResponse(p));
    if (!responses.length) return responses;

    const summaries = await this.commissionsService.summaryForPurchases(responses.map((r) => r.id));
    for (const response of responses) {
      const summary = summaries.get(response.id);
      response.commissionDue = summary?.due ?? 0;
      response.commissionPaid = summary?.paid ?? 0;
      response.commissions = summary?.lines ?? [];
      // The deal is parked at Registration with money still owed — this is
      // what every dashboard renders its "pay to finish" prompt from.
      response.awaitingCommission =
        response.dealStatus === DealStatus.IN_PROGRESS &&
        response.dealStep >= DEAL_STEPS.length &&
        response.commissionDue > 0;
    }
    return responses;
  }

  private assertValidId(id: string, label = 'purchase'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid ${label} ID`);
    }
  }

  private async loadOrThrow(id: string): Promise<PurchaseDocument> {
    this.assertValidId(id);
    const purchase = await this.purchaseModel.findById(id);
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${id}" not found`);
    }
    return purchase;
  }

  private assertCanView(purchase: PurchaseDocument, actor: AuthenticatedUser): void {
    if (isElevated(actor.role)) return;
    if (referenceId(purchase.buyerId) === actor.id) return;
    throw new ForbiddenException('You do not have permission to view this purchase');
  }

  /** Internal — called by NegotiationsService when an offer/counter is accepted. */
  async createFromNegotiation(negotiation: NegotiationDocument, agreedPrice: number): Promise<PurchaseDocument> {
    return this.purchaseModel.create({
      propertyId: negotiation.propertyId,
      buyerId: negotiation.buyerId,
      negotiationId: negotiation._id,
      agreedPrice,
      dealStep: 1,
      dealStatus: DealStatus.IN_PROGRESS,
    });
  }

  async findByOwner(buyerId: string): Promise<PurchaseResponseDto[]> {
    this.assertValidId(buyerId, 'user');
    const purchases = await this.purchaseModel
      .find({ buyerId })
      .populate('propertyId', 'title city state images listingType')
      .sort({ createdAt: -1 });
    return this.withCommissions(purchases);
  }

  /**
   * Admin/superuser purchase tracking queue, scoped by propertyIdsForAdmin
   * to the admin's own city — each city desk drives the deals on its own
   * properties. The superuser sees all four cities.
   */
  async findForReview(filters: PurchaseFilterDto, actor: AuthenticatedUser): Promise<PaginatedResult<PurchaseResponseDto>> {
    const query: Record<string, unknown> = {};
    if (filters.dealStatus) query.dealStatus = filters.dealStatus;
    const propertyIds = await this.propertiesService.propertyIdsForAdmin(actor);
    if (propertyIds) query.propertyId = { $in: propertyIds };

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.purchaseModel
        .find(query)
        .populate('propertyId', 'title city state images listingType')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.purchaseModel.countDocuments(query),
    ]);

    return {
      items: await this.withCommissions(items),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  /** Seller only — read-only view of purchases on properties this seller submitted. */
  async findForSeller(actor: AuthenticatedUser, filters: PurchaseFilterDto): Promise<PaginatedResult<PurchaseResponseDto>> {
    if (actor.userType !== UserType.SELLER) {
      throw new ForbiddenException('Only seller accounts have a purchase tracking queue');
    }
    const propertyIds = await this.propertiesService.propertyIdsForSeller(actor.id);
    const query: Record<string, unknown> = { propertyId: { $in: propertyIds } };
    if (filters.dealStatus) query.dealStatus = filters.dealStatus;

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.purchaseModel
        .find(query)
        .populate('propertyId', 'title city state images listingType')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.purchaseModel.countDocuments(query),
    ]);

    return {
      items: await this.withCommissions(items),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async findOne(id: string, actor: AuthenticatedUser): Promise<PurchaseResponseDto> {
    const purchase = await this.loadOrThrow(id);
    this.assertCanView(purchase, actor);
    await purchase.populate([
      { path: 'propertyId', select: 'title city state images listingType' },
      { path: 'buyerId', select: 'name email' },
    ]);
    return this.decorate(purchase);
  }

  /**
   * Advances to the next deal step; completes automatically after the final
   * step. Driven by the admin who runs the property's city (or the
   * superuser) — the same desk that verified the listing sees the purchase
   * through.
   */
  async advance(id: string, actor: AuthenticatedUser): Promise<PurchaseResponseDto> {
    const purchase = await this.loadOrThrow(id);
    await this.propertiesService.assertAdminHandlesProperty(referenceId(purchase.propertyId), actor);
    if (purchase.dealStatus !== DealStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot advance a purchase that is already ${purchase.dealStatus}`);
    }
    const propertyId = referenceId(purchase.propertyId);
    const registrationStep = DEAL_STEPS.length; // 5 — the final step

    // ── Already at Registration: this call is the one that closes the deal ──
    //
    // Registration is where the platform gets paid. Both commission invoices
    // were raised when this purchase entered the step, and the deal cannot be
    // marked complete while either is outstanding — that is the whole point of
    // billing at registration rather than after it, when there is no longer
    // any leverage to collect.
    if (purchase.dealStep >= registrationStep) {
      await this.assertCommissionSettled(purchase);
      purchase.dealStatus = DealStatus.COMPLETED;
      await purchase.save();
      return this.decorate(purchase);
    }

    purchase.dealStep += 1;
    await purchase.save();

    // ── Just entered Registration ──
    //
    // Full Payment (step 4) is behind us, so the property comes off the market
    // here rather than at completion: it stops appearing in buyer search and
    // no second buyer can offer on it while the paperwork is being done.
    // Commission is raised at the same moment, giving both parties a real
    // window in which to settle it.
    if (purchase.dealStep === registrationStep && propertyId) {
      await this.propertiesService.markDealClosed(propertyId);
      await this.accrueCommission(purchase, propertyId);
    }
    return this.decorate(purchase);
  }

  /**
   * Blocks completion while the platform's brokerage is unpaid.
   *
   * Answers 402 Payment Required, matching the listing-quota gate: the
   * request is legitimate, something simply has to be paid first. The message
   * names who still owes, because the admin pressing the button is usually
   * neither of them.
   */
  private async assertCommissionSettled(purchase: PurchaseDocument): Promise<void> {
    const outstanding = await this.commissionsService.outstandingForPurchase(purchase._id.toString());
    if (!outstanding.length) return;

    const total = outstanding.reduce((sum, c) => sum + c.amount, 0);
    const sides = outstanding.map((c) => c.side).join(' and ');
    throw new HttpException(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message:
          `Registration cannot be completed until the platform commission is settled. ` +
          `₹${total.toLocaleString('en-IN')} is still outstanding on the ${sides} ` +
          `side${outstanding.length > 1 ? 's' : ''} of this deal.`,
        error: 'Commission outstanding',
        commissionDue: total,
        commissionLines: outstanding.map((c) => ({
          id: c._id.toString(),
          side: c.side,
          amount: c.amount,
        })),
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  /**
   * Books the platform's brokerage on a deal that just closed.
   *
   * Raised the moment the deal reaches **Registration**, the final tracking
   * step — never earlier, so a deal that stalled or fell through bills nobody.
   * Deliberately non-fatal: if accrual fails the step change itself is still
   * legitimate, so it is logged loudly rather than surfaced as an error, and
   * `assertCommissionSettled` will simply find nothing outstanding.
   */
  private async accrueCommission(purchase: PurchaseDocument, propertyId: string): Promise<void> {
    try {
      const facts = await this.propertiesService.dealFacts(propertyId);
      const buyerId = referenceId(purchase.buyerId);
      if (!facts || !buyerId) return;
      await this.commissionsService.accrueForPurchase({
        purchaseId: purchase._id.toString(),
        propertyId,
        buyerId,
        sellerId: facts.sellerId,
        city: facts.city,
        listingType: facts.listingType,
        agreedPrice: purchase.agreedPrice,
      });
    } catch (error) {
      this.logger.error(
        `Failed to accrue commission for purchase ${purchase._id.toString()}: ${(error as Error).message}`,
      );
    }
  }

  /** The property's city admin (or the superuser) may cancel a purchase. */
  async cancel(id: string, actor: AuthenticatedUser): Promise<PurchaseResponseDto> {
    const purchase = await this.loadOrThrow(id);
    await this.propertiesService.assertAdminHandlesProperty(referenceId(purchase.propertyId), actor);
    // The property leaves the market on *entering* Registration, so a deal
    // sitting at that step is holding it just as much as a completed one is.
    const heldProperty =
      purchase.dealStatus === DealStatus.COMPLETED || purchase.dealStep >= DEAL_STEPS.length;
    purchase.dealStatus = DealStatus.CANCELLED;
    await purchase.save();

    // Cancelling the deal that took the property off the market puts it back
    // on — but only if no *other* live deal is still holding it, which would
    // otherwise re-list a property somebody else is buying.
    const propertyId = referenceId(purchase.propertyId);
    if (heldProperty && propertyId) {
      const stillClosed = await this.purchaseModel.countDocuments({
        _id: { $ne: purchase._id },
        propertyId: purchase.propertyId,
        $or: [
          { dealStatus: DealStatus.COMPLETED },
          { dealStatus: DealStatus.IN_PROGRESS, dealStep: { $gte: DEAL_STEPS.length } },
        ],
      });
      if (!stillClosed) await this.propertiesService.markDealReopened(propertyId);
    }
    return this.decorate(purchase);
  }
}
