import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingType } from '../../../shared/enums/property.enum.js';
import { DealStatus, DEAL_STEPS } from '../../../shared/enums/purchase.enum.js';
import { CommissionResponseDto } from '../../commissions/dto/commission-response.dto.js';

export class PurchaseResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  propertyId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  buyerId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  negotiationId: string | null;

  @ApiProperty({ example: 8800000 })
  agreedPrice: number;

  @ApiProperty({ example: 1, minimum: 1, maximum: 5 })
  dealStep: number;

  @ApiProperty({ example: DEAL_STEPS[0], enum: DEAL_STEPS, description: 'Human-readable label for dealStep' })
  dealStepLabel: string;

  @ApiProperty({ enum: DealStatus, example: DealStatus.IN_PROGRESS })
  dealStatus: DealStatus;

  @ApiPropertyOptional({ description: 'Populated on list/detail endpoints' })
  propertyTitle?: string;

  @ApiPropertyOptional()
  propertyCity?: string;

  @ApiPropertyOptional()
  propertyState?: string;

  @ApiPropertyOptional()
  propertyImage?: string | null;

  @ApiPropertyOptional({
    enum: ListingType,
    description: 'Whether the completed deal was a sale or a letting — the seller dashboard splits its Sold and Rent Given pages on this.',
  })
  propertyListingType?: ListingType;

  @ApiPropertyOptional({ description: 'Populated only on the admin review-queue endpoint' })
  buyerName?: string;

  @ApiPropertyOptional()
  buyerEmail?: string;

  @ApiPropertyOptional({
    description:
      'Platform commission still outstanding on this deal (₹). Raised when the purchase reaches ' +
      'Registration; the deal cannot be completed until it is 0.',
    example: 82600,
  })
  commissionDue?: number;

  @ApiPropertyOptional({ description: 'Commission already settled on this deal (₹)', example: 144550 })
  commissionPaid?: number;

  @ApiPropertyOptional({
    description:
      'True when the deal is parked at Registration with commission outstanding — the dashboards ' +
      'render their "pay to finish" prompt from this.',
    example: true,
  })
  awaitingCommission?: boolean;

  @ApiPropertyOptional({
    type: [CommissionResponseDto],
    description: 'The individual commission lines raised on this deal, buyer-side and seller-side.',
  })
  commissions?: CommissionResponseDto[];

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T05:30:00.000+05:30' })
  updatedAt: string;
}
