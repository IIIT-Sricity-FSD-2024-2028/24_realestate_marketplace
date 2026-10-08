import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import {
  PropertyType,
  PropertyStatus,
  ListingType,
  PropertyVerificationStatus,
} from '../../../shared/enums/property.enum.js';
import { FeaturedTier } from '../../../shared/enums/billing.enum.js';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ _id: false })
export class PropertyDocumentFile {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}
export const PropertyDocumentFileSchema = SchemaFactory.createForClass(PropertyDocumentFile);

@Schema({ timestamps: true, collection: 'properties' })
export class Property {
  @Prop({ required: true, trim: true, minlength: 10, maxlength: 150 })
  title: string;

  @Prop({ required: true, trim: true, minlength: 20 })
  description: string;

  @Prop({ type: String, enum: PropertyType, required: true, index: true })
  type: PropertyType;

  @Prop({ type: String, enum: ListingType, required: true, index: true })
  listingType: ListingType;

  @Prop({ required: true, min: 1, index: true })
  price: number;

  @Prop({ required: true, min: 1 })
  areaSqft: number;

  @Prop({ required: true, min: 0, max: 20 })
  bedrooms: number;

  @Prop({ required: true, min: 1, max: 20 })
  bathrooms: number;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true, index: true })
  city: string;

  @Prop({ required: true, trim: true, index: true })
  state: string;

  @Prop({ type: String, enum: PropertyStatus, default: PropertyStatus.AVAILABLE, index: true })
  status: PropertyStatus;

  @Prop({ type: [String], default: [] })
  images: string[];

  /** The admin who owns/manages (or verified) this listing. Property.adminId -> User._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
  adminId: Types.ObjectId | null;

  /** The seller who submitted this listing for review, if any. Property.sellerId -> User._id */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
  sellerId: Types.ObjectId | null;

  /**
   * Moderation state. Admin/superuser-created listings are auto-VERIFIED;
   * seller submissions start PENDING and are hidden from public search
   * until an admin/superuser verifies them (see PropertiesService.search).
   */
  @Prop({
    type: String,
    enum: PropertyVerificationStatus,
    default: PropertyVerificationStatus.VERIFIED,
    index: true,
  })
  verificationStatus: PropertyVerificationStatus;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;

  /**
   * Paid promotion (see FEATURED_PACKS in shared/constants/pricing.ts).
   *
   * A listing is featured only while `featuredUntil` is in the future — the
   * slot expires by date rather than by a cleanup job, so a lapsed promotion
   * can never keep occupying the top of search because a cron failed to run.
   */
  @Prop({ type: Date, default: null, index: true })
  featuredUntil: Date | null;

  @Prop({ type: String, enum: FeaturedTier, default: null })
  featuredTier: FeaturedTier | null;

  /** Higher wins when two live promotions compete for the top slot. */
  @Prop({ type: Number, default: 0 })
  featuredRank: number;

  /** Verification/ownership documents uploaded by the seller (deed, ID, etc.) */
  @Prop({ type: [PropertyDocumentFileSchema], default: [] })
  documents: PropertyDocumentFile[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

// Compound index to speed up the common listings-search filter combination.
PropertySchema.index({ city: 1, state: 1, type: 1, status: 1, price: 1 });

// Buyer search sorts promoted listings to the top before anything else.
PropertySchema.index({ featuredUntil: -1, featuredRank: -1, createdAt: -1 });
