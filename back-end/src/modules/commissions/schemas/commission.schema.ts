import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { CommissionSide, CommissionStatus } from '../../../shared/enums/billing.enum.js';

export type CommissionDocument = HydratedDocument<Commission>;

/**
 * Brokerage earned on a closed deal — the platform's largest revenue line.
 *
 * Two rows are written per completed purchase (one buyer-side, one
 * seller-side) rather than a single combined figure, because the two are
 * owed by different people, at different rates, and get settled separately.
 *
 * A row is created the moment a purchase completes, in ACCRUED state: the
 * platform has *earned* that money even before it is collected, which is the
 * difference the revenue report draws between "collected" and "receivable".
 */
@Schema({ timestamps: true, collection: 'commissions' })
export class Commission {
  /** Commission.purchaseId -> Purchase._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Purchase', required: true, index: true })
  purchaseId: Types.ObjectId;

  /** Commission.propertyId -> Property._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId: Types.ObjectId;

  /** Who owes this line. Commission.partyId -> User._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  partyId: Types.ObjectId;

  @Prop({ type: String, enum: CommissionSide, required: true, index: true })
  side: CommissionSide;

  /** The price the commission was computed on. For a rental, the annual rent. */
  @Prop({ required: true, min: 0 })
  dealValue: number;

  /** Rate applied, in basis points — after any plan discount. Stored so an old
   *  invoice still explains itself if the rate card later changes. */
  @Prop({ required: true, min: 0 })
  rateBps: number;

  /** Commission before GST, in ₹. */
  @Prop({ required: true, min: 0 })
  baseAmount: number;

  @Prop({ required: true, min: 0 })
  taxAmount: number;

  /** Total owed — `baseAmount + taxAmount`. */
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: CommissionStatus, default: CommissionStatus.ACCRUED, index: true })
  status: CommissionStatus;

  /** The payment that settled this line. Commission.paymentId -> Payment._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Payment', default: null })
  paymentId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  settledAt: Date | null;

  /** Why a superuser wrote this line off, when they did. */
  @Prop({ type: String, default: null })
  waiverReason: string | null;

  /** City of the property, denormalised so revenue can be reported per city
   *  without joining back to properties on every report query. */
  @Prop({ type: String, default: null, index: true })
  city: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

// One commission per side per purchase — makes accrual safely idempotent even
// if a purchase somehow completes twice.
CommissionSchema.index({ purchaseId: 1, side: 1 }, { unique: true });
CommissionSchema.index({ partyId: 1, status: 1 });
