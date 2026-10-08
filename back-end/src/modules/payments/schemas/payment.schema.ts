import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { PaymentPurpose, PaymentStatus } from '../../../shared/enums/billing.enum.js';

export type PaymentDocument = HydratedDocument<Payment>;

/**
 * One row per attempted payment — the platform's ledger.
 *
 * A row is written the moment an order is opened (status CREATED), *before*
 * any money moves, and only ever flips to PAID once a gateway signature has
 * been verified server-side. That ordering is what makes the revenue report
 * trustworthy: every rupee counted as revenue has a verified signature
 * sitting next to it, and abandoned checkouts stay visible as CREATED rather
 * than vanishing.
 */
@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  /** Who is paying. Payment.userId -> User._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentPurpose, required: true, index: true })
  purpose: PaymentPurpose;

  /** Base amount in whole rupees, before GST. */
  @Prop({ required: true, min: 0 })
  baseAmount: number;

  /** GST charged on top of `baseAmount`, in rupees. */
  @Prop({ required: true, min: 0, default: 0 })
  taxAmount: number;

  /** What was actually charged — `baseAmount + taxAmount`. This is the ledger figure. */
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.CREATED, index: true })
  status: PaymentStatus;

  /** Which driver handled this — `mock` or `razorpay`. Kept for reconciliation. */
  @Prop({ required: true })
  gateway: string;

  @Prop({ required: true, index: true })
  gatewayOrderId: string;

  @Prop({ type: String, default: null })
  gatewayPaymentId: string | null;

  /** The verified HMAC. Retained as proof this payment was authenticated. */
  @Prop({ type: String, default: null })
  gatewaySignature: string | null;

  /** Our own human-readable reference, e.g. `TRU-SUB-8F2A19`. Shown on the receipt. */
  @Prop({ required: true, unique: true })
  receipt: string;

  /** Human-readable line item, e.g. "Gold plan — 3 months". */
  @Prop({ required: true })
  description: string;

  /**
   * Purpose-specific context: the plan tier and cycle for a subscription, the
   * property and pack for a featured slot, the commission id for a settlement.
   * Free-form so a new revenue stream needs no schema migration.
   */
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, unknown>;

  /** Why a payment failed, when it did. */
  @Prop({ type: String, default: null })
  failureReason: string | null;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// The two access patterns: a user's own payment history, and the superuser
// revenue report (paid rows in a date range, grouped by purpose).
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, purpose: 1, paidAt: -1 });
