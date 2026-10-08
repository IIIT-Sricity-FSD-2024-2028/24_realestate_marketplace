import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { PlanTier, SubscriptionStatus } from '../../../shared/enums/billing.enum.js';

export type SubscriptionDocument = HydratedDocument<Subscription>;

/**
 * A seller's paid plan.
 *
 * There is no row for a seller on the free tier — absence *is* the free tier.
 * That keeps the free path zero-cost (no write on signup, no backfill for
 * existing accounts) and means `currentPlan()` can answer for any seller,
 * including ones created long before billing existed.
 */
@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
  /** Subscription.sellerId -> User._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: String, enum: PlanTier, required: true })
  tier: PlanTier;

  /** `monthly` | `quarterly` | `yearly` — see BILLING_CYCLES in the rate card. */
  @Prop({ required: true })
  cycle: string;

  /** What was actually charged for this term, in ₹ (inclusive of GST). */
  @Prop({ required: true, min: 0 })
  amountPaid: number;

  @Prop({ type: String, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE, index: true })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startsAt: Date;

  /** After this instant the seller silently falls back to the free tier's quota. */
  @Prop({ required: true, index: true })
  expiresAt: Date;

  /** The payment that bought this term. Subscription.paymentId -> Payment._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Payment', default: null })
  paymentId: Types.ObjectId | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// The hot path: "what is this seller's live plan right now".
SubscriptionSchema.index({ sellerId: 1, status: 1, expiresAt: -1 });
