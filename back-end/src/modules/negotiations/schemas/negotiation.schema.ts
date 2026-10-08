import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { NegotiationStatus } from '../../../shared/enums/negotiation.enum.js';

export type NegotiationDocument = HydratedDocument<Negotiation>;

@Schema({ timestamps: true, collection: 'negotiations' })
export class Negotiation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  /** The buyer's current offer. */
  @Prop({ required: true, min: 1 })
  offerAmount: number;

  /** The seller's counter-offer, if any. */
  @Prop({ type: Number, default: null })
  counterAmount: number | null;

  @Prop({ type: String, default: null })
  message: string | null;

  @Prop({ type: String, default: null })
  paymentMode: string | null;

  @Prop({ type: String, enum: NegotiationStatus, default: NegotiationStatus.PENDING, index: true })
  status: NegotiationStatus;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NegotiationSchema = SchemaFactory.createForClass(Negotiation);
NegotiationSchema.index({ buyerId: 1, status: 1 });
