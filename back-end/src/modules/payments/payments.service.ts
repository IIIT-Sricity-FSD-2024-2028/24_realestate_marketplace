import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema.js';
import { PaymentResponseDto, CheckoutOrderDto } from './dto/payment-response.dto.js';
import { VerifyPaymentDto } from './dto/create-payment.dto.js';
import { PAYMENT_GATEWAY, type PaymentGateway } from './gateway/payment-gateway.interface.js';
import { PaymentPurpose, PaymentStatus } from '../../shared/enums/billing.enum.js';
import { referenceId } from '../../shared/helpers/reference-id.helper.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

/** Short receipt prefix per revenue stream, so a receipt says what it was for. */
const RECEIPT_PREFIX: Record<PaymentPurpose, string> = {
  [PaymentPurpose.SUBSCRIPTION]: 'SUB',
  [PaymentPurpose.FEATURED_LISTING]: 'FTR',
  [PaymentPurpose.COMMISSION]: 'COM',
};

export interface OpenOrderInput {
  userId: string;
  purpose: PaymentPurpose;
  /** Pre-tax amount in ₹, always computed server-side from the rate card. */
  baseAmount: number;
  taxAmount: number;
  description: string;
  metadata?: Record<string, unknown>;
}

interface PopulatedPayer {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
}

function isPopulated(ref: unknown): ref is PopulatedPayer {
  return !!ref && typeof ref === 'object' && '_id' in (ref as object);
}

/**
 * The payment ledger and the gateway conversation — and nothing else.
 *
 * This service deliberately knows nothing about plans, listings or
 * commission. It opens orders, verifies signatures and records outcomes.
 * Deciding *what a successful payment unlocks* belongs to BillingService,
 * which keeps this class free of every domain import and therefore free of
 * circular dependencies.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  get gatewayName(): string {
    return this.gateway.name;
  }

  get isLive(): boolean {
    return this.gateway.isLive;
  }

  toResponse(p: PaymentDocument): PaymentResponseDto {
    const payer = p.userId as unknown;
    return {
      id: p._id.toString(),
      userId: referenceId(payer),
      purpose: p.purpose,
      description: p.description,
      baseAmount: p.baseAmount,
      taxAmount: p.taxAmount,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      receipt: p.receipt,
      gateway: p.gateway,
      gatewayOrderId: p.gatewayOrderId,
      gatewayPaymentId: p.gatewayPaymentId ?? null,
      metadata: p.metadata ?? {},
      failureReason: p.failureReason ?? null,
      paidAt: p.paidAt ? istTimestamp(p.paidAt) : null,
      ...(isPopulated(payer) && {
        payerName: (payer as PopulatedPayer).name,
        payerEmail: (payer as PopulatedPayer).email,
      }),
      createdAt: istTimestamp(p.createdAt ?? new Date()),
      updatedAt: istTimestamp(p.updatedAt ?? new Date()),
    };
  }

  private receiptFor(purpose: PaymentPurpose): string {
    return `TRU-${RECEIPT_PREFIX[purpose]}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  /**
   * Opens a gateway order and writes the CREATED ledger row.
   *
   * The row is persisted *before* the client is told to pay, so an
   * abandoned checkout still leaves a trace and a webhook arriving for an
   * order we never recorded is impossible.
   */
  async openOrder(input: OpenOrderInput): Promise<{ payment: PaymentDocument; checkout: CheckoutOrderDto }> {
    const total = input.baseAmount + input.taxAmount;
    if (total <= 0) {
      throw new BadRequestException('Nothing to pay — this item is free.');
    }

    const receipt = this.receiptFor(input.purpose);
    const order = await this.gateway.createOrder({
      amountInRupees: total,
      receipt,
      notes: {
        purpose: input.purpose,
        userId: input.userId,
        description: input.description,
      },
    });

    const payment = await this.paymentModel.create({
      userId: new Types.ObjectId(input.userId),
      purpose: input.purpose,
      baseAmount: input.baseAmount,
      taxAmount: input.taxAmount,
      amount: total,
      currency: order.currency,
      status: PaymentStatus.CREATED,
      gateway: this.gateway.name,
      gatewayOrderId: order.orderId,
      receipt,
      description: input.description,
      metadata: input.metadata ?? {},
    });

    return {
      payment,
      checkout: {
        orderId: order.orderId,
        paymentId: payment._id.toString(),
        amount: total,
        baseAmount: input.baseAmount,
        taxAmount: input.taxAmount,
        currency: order.currency,
        keyId: order.keyId,
        gateway: this.gateway.name,
        isLive: this.gateway.isLive,
        description: input.description,
        receipt,
      },
    };
  }

  /**
   * Verifies a checkout result and marks the payment PAID.
   *
   * This is the security boundary of the whole revenue system. The signature
   * is an HMAC keyed with a secret the client never sees, so a client cannot
   * fabricate a successful payment — and because the amount was fixed when
   * the order was opened, it cannot change what it paid either.
   *
   * Returns the payment for BillingService to fulfil. Idempotent: replaying
   * the same verification does not double-fulfil, it is rejected outright.
   */
  async verifyAndCapture(dto: VerifyPaymentDto, userId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ gatewayOrderId: dto.orderId });
    if (!payment) {
      throw new NotFoundException(`No payment found for order "${dto.orderId}"`);
    }
    if (referenceId(payment.userId) !== userId) {
      throw new BadRequestException('This payment belongs to a different account');
    }
    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('This payment has already been completed');
    }

    const valid = this.gateway.verifySignature({
      orderId: dto.orderId,
      paymentId: dto.paymentId,
      signature: dto.signature,
    });

    if (!valid) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Signature verification failed';
      await payment.save();
      this.logger.warn(`Rejected payment ${payment.receipt}: bad signature on order ${dto.orderId}`);
      throw new BadRequestException('Payment could not be verified. You have not been charged.');
    }

    payment.status = PaymentStatus.PAID;
    payment.gatewayPaymentId = dto.paymentId;
    payment.gatewaySignature = dto.signature;
    payment.paidAt = new Date();
    payment.failureReason = null;
    await payment.save();

    this.logger.log(`Payment ${payment.receipt} captured — ₹${payment.amount} (${payment.purpose})`);
    return payment;
  }

  /** Records a cancelled/declined checkout so the funnel stays honest. */
  async markFailed(orderId: string, userId: string, reason: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ gatewayOrderId: orderId });
    if (!payment) throw new NotFoundException(`No payment found for order "${orderId}"`);
    if (referenceId(payment.userId) !== userId) {
      throw new BadRequestException('This payment belongs to a different account');
    }
    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('A completed payment cannot be marked failed');
    }
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason || 'Cancelled by user';
    await payment.save();
    return this.toResponse(payment);
  }

  /** The mock driver's stand-in for the hosted checkout widget. */
  simulateCheckout(orderId: string): { orderId: string; paymentId: string; signature: string } {
    if (!this.gateway.simulateCheckout) {
      throw new BadRequestException(
        'The demo checkout is disabled because a live payment gateway is configured.',
      );
    }
    try {
      return this.gateway.simulateCheckout(orderId);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return this.gateway.verifyWebhook(rawBody, signature);
  }

  /** Marks paid from a webhook — the safety net when the browser never came back. */
  async captureFromWebhook(orderId: string, gatewayPaymentId: string): Promise<PaymentDocument | null> {
    const payment = await this.paymentModel.findOne({ gatewayOrderId: orderId });
    if (!payment || payment.status === PaymentStatus.PAID) return null;
    payment.status = PaymentStatus.PAID;
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.paidAt = new Date();
    await payment.save();
    this.logger.log(`Payment ${payment.receipt} captured via webhook — ₹${payment.amount}`);
    return payment;
  }

  async findByUser(userId: string, limit = 50): Promise<PaymentResponseDto[]> {
    const rows = await this.paymentModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    return rows.map((p) => this.toResponse(p));
  }

  /** Superuser ledger — every payment, newest first, with the payer populated. */
  async findAll(limit = 100): Promise<PaymentResponseDto[]> {
    const rows = await this.paymentModel
      .find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return rows.map((p) => this.toResponse(p));
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException(`"${id}" is not a valid payment ID`);
    const payment = await this.paymentModel.findById(id).populate('userId', 'name email');
    if (!payment) throw new NotFoundException(`Payment with ID "${id}" not found`);
    return this.toResponse(payment);
  }

  /** Total collected, grouped by revenue stream. Drives the superuser report. */
  async totalsByPurpose(): Promise<Record<string, { amount: number; count: number }>> {
    const rows = await this.paymentModel.aggregate<{ _id: string; amount: number; count: number }>([
      { $match: { status: PaymentStatus.PAID } },
      { $group: { _id: '$purpose', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, { amount: r.amount, count: r.count }]));
  }

  /** Collected revenue per calendar month (IST), oldest first, for the trend chart. */
  async monthlyTotals(months = 6): Promise<{ month: string; amount: number; count: number }[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const rows = await this.paymentModel.aggregate<{ _id: string; amount: number; count: number }>([
      { $match: { status: PaymentStatus.PAID, paidAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidAt', timezone: 'Asia/Kolkata' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Zero-fill, so a quiet month shows as an empty bar rather than being
    // silently dropped and skewing the shape of the trend.
    const byMonth = new Map(rows.map((r) => [r._id, r]));
    const series: { month: string; amount: number; count: number }[] = [];
    for (let i = 0; i < months; i += 1) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const hit = byMonth.get(key);
      series.push({ month: key, amount: hit?.amount ?? 0, count: hit?.count ?? 0 });
    }
    return series;
  }

  /** Checkout conversion — how many opened orders actually completed. */
  async statusCounts(): Promise<Record<string, number>> {
    const rows = await this.paymentModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, r.count]));
  }
}
