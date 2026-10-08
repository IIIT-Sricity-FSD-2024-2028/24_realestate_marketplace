import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { VisitStatus } from '../../../shared/enums/visit.enum.js';

export type VisitDocument = HydratedDocument<Visit>;

@Schema({ timestamps: true, collection: 'visits' })
export class Visit {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  /** Free-form date string chosen by the buyer/admin, e.g. "2026-03-10". */
  @Prop({ required: true })
  requestedDate: string;

  /** Free-form time-slot label, e.g. "10:00 AM". */
  @Prop({ required: true })
  requestedSlot: string;

  @Prop({ type: String, default: null })
  message: string | null;

  @Prop({ type: String, enum: VisitStatus, default: VisitStatus.PENDING, index: true })
  status: VisitStatus;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ buyerId: 1, status: 1 });
