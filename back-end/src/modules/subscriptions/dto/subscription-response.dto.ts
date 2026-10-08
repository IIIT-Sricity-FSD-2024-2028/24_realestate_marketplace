import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanTier, SubscriptionStatus } from '../../../shared/enums/billing.enum.js';

export class SubscriptionResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  id: string | null;

  @ApiProperty({ enum: PlanTier, example: PlanTier.GOLD })
  tier: PlanTier;

  @ApiProperty({ example: 'Gold' })
  planName: string;

  @ApiProperty({ example: 'quarterly', nullable: true })
  cycle: string | null;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Properties this plan allows in total. `null` means unlimited.',
    example: null,
    nullable: true,
  })
  listingQuota: number | null;

  @ApiProperty({
    description:
      'Properties on the account, counted against the quota. Includes sold and rented ' +
      'listings — a closed deal does not free a slot.',
    example: 4,
  })
  listingsUsed: number;

  @ApiProperty({ description: 'How many more properties this plan allows. `null` = unlimited.', nullable: true })
  listingsRemaining: number | null;

  @ApiProperty({ description: 'Discount on seller commission, in basis points', example: 50 })
  commissionDiscountBps: number;

  @ApiProperty({ type: [String] })
  highlights: string[];

  @ApiProperty({ example: '2026-08-28T09:19:55.704+05:30', nullable: true })
  startsAt: string | null;

  @ApiProperty({ example: '2026-11-28T09:19:55.704+05:30', nullable: true })
  expiresAt: string | null;

  @ApiProperty({ description: 'Days left in the current term. 0 on the free tier.', example: 61 })
  daysRemaining: number;

  @ApiPropertyOptional({ description: 'Set when the plan expires within a week' })
  renewalDue?: boolean;
}
