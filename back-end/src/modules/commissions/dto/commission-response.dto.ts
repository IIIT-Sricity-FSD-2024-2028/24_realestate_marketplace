import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionSide, CommissionStatus } from '../../../shared/enums/billing.enum.js';

export class CommissionResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  purchaseId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  propertyId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  partyId: string | null;

  @ApiProperty({ enum: CommissionSide, example: CommissionSide.SELLER })
  side: CommissionSide;

  @ApiProperty({ description: 'Price the commission was computed on (₹)', example: 8500000 })
  dealValue: number;

  @ApiProperty({ description: 'Rate applied, in basis points (100 = 1%)', example: 150 })
  rateBps: number;

  @ApiProperty({ description: 'Rate as a percentage, for display', example: 1.5 })
  ratePercent: number;

  @ApiProperty({ example: 127500 })
  baseAmount: number;

  @ApiProperty({ example: 22950 })
  taxAmount: number;

  @ApiProperty({ example: 150450 })
  amount: number;

  @ApiProperty({ enum: CommissionStatus, example: CommissionStatus.ACCRUED })
  status: CommissionStatus;

  @ApiProperty({ example: 'Hyderabad', nullable: true })
  city: string | null;

  @ApiProperty({ example: null, nullable: true })
  settledAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  waiverReason: string | null;

  @ApiPropertyOptional({ description: 'Populated on list endpoints' })
  propertyTitle?: string;

  @ApiPropertyOptional()
  partyName?: string;

  @ApiPropertyOptional()
  partyEmail?: string;

  @ApiProperty({ example: '2026-08-28T09:19:55.704+05:30' })
  createdAt: string;
}
