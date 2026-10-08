import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { DealStatus } from '../../../shared/enums/purchase.enum.js';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: true, collection: 'purchases' })
export class Purchase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  /** The negotiation this purchase was created from (purchases always originate from an accepted offer). */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Negotiation', default: null })
  negotiationId: Types.ObjectId | null;

  @Prop({ required: true, min: 1 })
  agreedPrice: number;

  /** 1-indexed into DEAL_STEPS (Offer Accepted, Document Verification, Token Payment, Full Payment, Registration). */
  @Prop({ required: true, min: 1, max: 5, default: 1 })
  dealStep: number;

  @Prop({ type: String, enum: DealStatus, default: DealStatus.IN_PROGRESS, index: true })
  dealStatus: DealStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
PurchaseSchema.index({ buyerId: 1, dealStatus: 1 });
