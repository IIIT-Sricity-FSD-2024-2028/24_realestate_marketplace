import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PropertyType,
  PropertyStatus,
  ListingType,
  PropertyVerificationStatus,
} from '../../../shared/enums/property.enum.js';
import { FeaturedTier } from '../../../shared/enums/billing.enum.js';

export class PropertyDocumentFileDto {
  @ApiProperty({ example: '/uploads/property-documents/65f.../deed-1699999999.pdf' })
  url: string;

  @ApiProperty({ example: 'ownership-deed.pdf' })
  originalName: string;

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  uploadedAt: string;
}

export class PropertyResponseDto {
  @ApiProperty({ example: 'prop_000001' })
  id: string;

  @ApiProperty({ example: '3BHK Spacious Apartment in Anna Nagar' })
  title: string;

  @ApiProperty({ example: 'Beautifully furnished 3BHK with sea view.' })
  description: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  type: PropertyType;

  @ApiProperty({ enum: ListingType, example: ListingType.SALE })
  listingType: ListingType;

  @ApiProperty({ example: 7500000 })
  price: number;

  @ApiProperty({ example: 1200 })
  areaSqft: number;

  @ApiProperty({ example: 3 })
  bedrooms: number;

  @ApiProperty({ example: 2 })
  bathrooms: number;

  @ApiProperty({ example: '42, 5th Avenue, Anna Nagar, Chennai' })
  address: string;

  @ApiProperty({ example: 'Chennai' })
  city: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  state: string;

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @ApiProperty({
    type: [String],
    example: ['https://cdn.example.com/img1.jpg'],
  })
  images: string[];

  @ApiProperty({ example: 'usr_000002', nullable: true, description: 'Owning/verifying admin' })
  adminId: string | null;

  @ApiProperty({ example: null, nullable: true, description: 'Submitting seller, if this listing came from a seller' })
  sellerId: string | null;

  @ApiProperty({
    enum: PropertyVerificationStatus,
    example: PropertyVerificationStatus.VERIFIED,
    description: 'Admin/superuser listings are auto-verified; seller submissions start pending',
  })
  verificationStatus: PropertyVerificationStatus;

  @ApiProperty({ example: null, nullable: true })
  rejectionReason: string | null;

  @ApiProperty({
    description: 'True while a paid promotion is live. Buyer search sorts these to the top.',
    example: false,
  })
  isFeatured: boolean;

  @ApiProperty({ enum: FeaturedTier, example: null, nullable: true })
  featuredTier: FeaturedTier | null;

  @ApiProperty({ example: null, nullable: true, description: 'When the promotion lapses' })
  featuredUntil: string | null;

  @ApiPropertyOptional({
    type: [PropertyDocumentFileDto],
    description:
      'Private verification documents (ownership deed, ID, etc.) — only present when the caller is ' +
      "the admin/superuser or the seller who owns this listing. Never sent to buyers/public callers; " +
      'use `images` for buyer-facing photos instead.',
  })
  documents?: PropertyDocumentFileDto[];

  @ApiPropertyOptional({ example: 'Sam Seller', description: 'Populated only on the admin review-queue endpoint' })
  sellerName?: string;

  @ApiPropertyOptional({ example: 'sam.seller@example.com', description: 'Populated only on the admin review-queue endpoint' })
  sellerEmail?: string;

  @ApiPropertyOptional({
    description: "The seller's phone number, or null if they haven't given one. Review queue only.",
    nullable: true,
  })
  sellerPhone?: string | null;

  @ApiPropertyOptional({
    description: 'When the seller registered — shown as "Since" in the admin seller list. Review queue only.',
    nullable: true,
  })
  sellerSince?: string | null;

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T05:30:00.000+05:30' })
  updatedAt: string;
}
