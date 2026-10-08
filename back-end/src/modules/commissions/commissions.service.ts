import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Commission, CommissionDocument } from './schemas/commission.schema.js';
import { CommissionResponseDto } from './dto/commission-response.dto.js';
import { CommissionSide, CommissionStatus } from '../../shared/enums/billing.enum.js';
import { COMMISSION_BPS, bpsOf, gstOn } from '../../shared/constants/pricing.js';
import { ListingType } from '../../shared/enums/property.enum.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { referenceId } from '../../shared/helpers/reference-id.helper.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

/** Everything about a closed deal that commission is computed from. */
export interface DealFacts {
  purchaseId: string;
  propertyId: string;
  buyerId: string;
  /** Null when the listing was created by an admin with no seller behind it. */
  sellerId: string | null;
  city: string | null;
  listingType: ListingType;
  /** The agreed price. For a rental this is the monthly rent. */
  agreedPrice: number;
}

interface PopulatedRef {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  title?: string;
}

function isPopulated(ref: unknown): ref is PopulatedRef {
  return !!ref && typeof ref === 'object' && '_id' in (ref as object);
}

/**
 * Brokerage on closed deals.
 *
 * Commission is *earned* the instant a purchase completes and *collected*
 * later, so this service keeps those two ideas apart: `accrueForPurchase`
 * books the receivable, `settle` records the payment against it.
 */
@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    @InjectModel(Commission.name) private readonly commissionModel: Model<CommissionDocument>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  toResponse(c: CommissionDocument): CommissionResponseDto {
    const property = c.propertyId as unknown;
    const party = c.partyId as unknown;
    return {
      id: c._id.toString(),
      purchaseId: referenceId(c.purchaseId),
      propertyId: referenceId(property),
      partyId: referenceId(party),
      side: c.side,
      dealValue: c.dealValue,
      rateBps: c.rateBps,
      ratePercent: Number((c.rateBps / 100).toFixed(2)),
      baseAmount: c.baseAmount,
      taxAmount: c.taxAmount,
      amount: c.amount,
      status: c.status,
      city: c.city ?? null,
      settledAt: c.settledAt ? istTimestamp(c.settledAt) : null,
      waiverReason: c.waiverReason ?? null,
      ...(isPopulated(property) && { propertyTitle: (property as PopulatedRef).title }),
      ...(isPopulated(party) && {
        partyName: (party as PopulatedRef).name,
        partyEmail: (party as PopulatedRef).email,
      }),
      createdAt: istTimestamp(c.createdAt ?? new Date()),
    };
  }

  /**
   * Books the commission owed on a completed deal.
   *
   * Called by PurchasesService the moment a purchase reaches COMPLETED —
   * never before, because truEstate does not bill for a deal that fell
   * through. Safe to call twice: the unique (purchaseId, side) index makes a
   * duplicate accrual a no-op rather than double-billing anyone.
   *
   * Rental commission is charged on the *annual* rent, not the monthly figure
   * on the listing, which is the market convention.
   */
  async accrueForPurchase(facts: DealFacts): Promise<CommissionDocument[]> {
    const isRent = facts.listingType === ListingType.RENT;
    const rates = isRent ? COMMISSION_BPS.rent : COMMISSION_BPS.sale;
    const dealValue = isRent ? facts.agreedPrice * 12 : facts.agreedPrice;

    // The seller's plan buys down their rate — the reason a Gold plan can pay
    // for itself on a single sale. It can never push the rate below zero.
    const plan = facts.sellerId ? await this.subscriptionsService.activePlan(facts.sellerId) : null;
    const sellerBps = Math.max(0, rates.seller - (plan?.definition.commissionDiscountBps ?? 0));

    const lines: { side: CommissionSide; partyId: string; rateBps: number }[] = [
      { side: CommissionSide.BUYER, partyId: facts.buyerId, rateBps: rates.buyer },
    ];
    // An admin-listed property has no seller to bill; only the buyer side accrues.
    if (facts.sellerId) {
      lines.push({ side: CommissionSide.SELLER, partyId: facts.sellerId, rateBps: sellerBps });
    }

    const created: CommissionDocument[] = [];
    for (const line of lines) {
      const baseAmount = bpsOf(dealValue, line.rateBps);
      if (baseAmount <= 0) continue;
      const taxAmount = gstOn(baseAmount);
      try {
        const doc = await this.commissionModel.create({
          purchaseId: new Types.ObjectId(facts.purchaseId),
          propertyId: new Types.ObjectId(facts.propertyId),
          partyId: new Types.ObjectId(line.partyId),
          side: line.side,
          dealValue,
          rateBps: line.rateBps,
          baseAmount,
          taxAmount,
          amount: baseAmount + taxAmount,
          status: CommissionStatus.ACCRUED,
          city: facts.city,
        });
        created.push(doc);
      } catch (error) {
        // Duplicate key = already accrued for this purchase/side. Anything
        // else is a real failure and must not be swallowed.
        if ((error as { code?: number }).code === 11000) continue;
        throw error;
      }
    }

    if (created.length) {
      const total = created.reduce((sum, c) => sum + c.amount, 0);
      this.logger.log(
        `Accrued ₹${total} commission on purchase ${facts.purchaseId} (${created.length} line(s))`,
      );
    }
    return created;
  }

  async loadOrThrow(id: string): Promise<CommissionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid commission ID`);
    }
    const commission = await this.commissionModel.findById(id);
    if (!commission) throw new NotFoundException(`Commission with ID "${id}" not found`);
    return commission;
  }

  /** The commission invoice a given party is about to pay — used to price checkout. */
  async loadPayable(id: string, partyId: string): Promise<CommissionDocument> {
    const commission = await this.loadOrThrow(id);
    if (referenceId(commission.partyId) !== partyId) {
      throw new ForbiddenException('This commission invoice belongs to a different account');
    }
    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('This commission has already been settled');
    }
    if (commission.status === CommissionStatus.WAIVED) {
      throw new BadRequestException('This commission was waived — nothing is owed');
    }
    return commission;
  }

  /** Marks a commission settled. Called only after a verified payment. */
  async settle(commissionId: string, paymentId: string): Promise<CommissionDocument> {
    const commission = await this.loadOrThrow(commissionId);
    commission.status = CommissionStatus.PAID;
    commission.paymentId = new Types.ObjectId(paymentId);
    commission.settledAt = new Date();
    await commission.save();
    this.logger.log(`Commission ${commissionId} settled — ₹${commission.amount}`);
    return commission;
  }

  /** Superuser write-off. The line stays on the books, marked WAIVED. */
  async waive(commissionId: string, reason: string): Promise<CommissionResponseDto> {
    const commission = await this.loadOrThrow(commissionId);
    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('A settled commission cannot be waived');
    }
    commission.status = CommissionStatus.WAIVED;
    commission.waiverReason = reason || 'Waived by platform';
    await commission.save();
    return this.toResponse(commission);
  }

  /**
   * Reverses a write-off, putting the invoice back on the books as payable.
   *
   * A waiver is a judgement call, and judgement calls get made in error or
   * get overtaken by events — the party turns out to be willing to pay after
   * all. Without this the only way back would be editing the database by
   * hand, so the waiver is deliberately non-destructive: the line keeps its
   * amount and rate, and only the status and reason are cleared.
   */
  async reinstate(commissionId: string): Promise<CommissionResponseDto> {
    const commission = await this.loadOrThrow(commissionId);
    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('This commission has already been settled — there is nothing to reinstate');
    }
    if (commission.status === CommissionStatus.ACCRUED) {
      throw new BadRequestException('This commission is already outstanding');
    }
    commission.status = CommissionStatus.ACCRUED;
    commission.waiverReason = null;
    await commission.save();
    this.logger.log(`Commission ${commissionId} reinstated — ₹${commission.amount} payable again`);
    return this.toResponse(commission);
  }

  /**
   * What is still owed on one deal. Drives the Registration gate: a purchase
   * cannot be marked complete while this returns anything.
   */
  async outstandingForPurchase(purchaseId: string): Promise<CommissionDocument[]> {
    if (!Types.ObjectId.isValid(purchaseId)) return [];
    return this.commissionModel.find({
      purchaseId: new Types.ObjectId(purchaseId),
      status: CommissionStatus.ACCRUED,
    });
  }

  /**
   * Commission totals for many purchases in one query, keyed by purchase id.
   *
   * Used to decorate purchase-tracking lists. Deliberately a single `$in`
   * aggregate rather than a lookup per row — the buyer's deals page renders a
   * card per purchase, and a query each would be an N+1 on every poll.
   */
  async summaryForPurchases(
    purchaseIds: string[],
  ): Promise<Map<string, { due: number; paid: number; lines: CommissionResponseDto[] }>> {
    const ids = purchaseIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
    const result = new Map<string, { due: number; paid: number; lines: CommissionResponseDto[] }>();
    if (!ids.length) return result;

    const rows = await this.commissionModel.find({ purchaseId: { $in: ids } });
    for (const row of rows) {
      const key = referenceId(row.purchaseId) ?? '';
      const entry = result.get(key) ?? { due: 0, paid: 0, lines: [] };
      if (row.status === CommissionStatus.ACCRUED) entry.due += row.amount;
      if (row.status === CommissionStatus.PAID) entry.paid += row.amount;
      entry.lines.push(this.toResponse(row));
      result.set(key, entry);
    }
    return result;
  }

  /** Every commission line owed by (or already paid by) one account. */
  async findByParty(partyId: string): Promise<CommissionResponseDto[]> {
    if (!Types.ObjectId.isValid(partyId)) return [];
    const rows = await this.commissionModel
      .find({ partyId })
      .populate('propertyId', 'title')
      .sort({ createdAt: -1 });
    return rows.map((c) => this.toResponse(c));
  }

  /** Platform-wide commission book, newest first. */
  async findAll(limit = 100): Promise<CommissionResponseDto[]> {
    const rows = await this.commissionModel
      .find()
      .populate('propertyId', 'title')
      .populate('partyId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return rows.map((c) => this.toResponse(c));
  }

  /** Earned vs collected vs written off — the core of the revenue report. */
  async totals(): Promise<Record<string, { amount: number; count: number }>> {
    const rows = await this.commissionModel.aggregate<{ _id: string; amount: number; count: number }>([
      { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, { amount: r.amount, count: r.count }]));
  }

  /** Commission earned per city — which desks actually make the money. */
  async totalsByCity(): Promise<{ city: string; amount: number; deals: number }[]> {
    const rows = await this.commissionModel.aggregate<{ _id: string | null; amount: number; deals: number }>([
      { $match: { status: { $ne: CommissionStatus.WAIVED } } },
      { $group: { _id: '$city', amount: { $sum: '$amount' }, deals: { $addToSet: '$purchaseId' } } },
      { $project: { amount: 1, deals: { $size: '$deals' } } },
      { $sort: { amount: -1 } },
    ]);
    return rows.map((r) => ({ city: r._id ?? 'Unknown', amount: r.amount, deals: r.deals }));
  }
}
