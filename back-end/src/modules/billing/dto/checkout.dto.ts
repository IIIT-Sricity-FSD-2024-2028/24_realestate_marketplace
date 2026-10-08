import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsMongoId, IsOptional } from 'class-validator';
import { FeaturedTier, PaymentPurpose, PlanTier } from '../../../shared/enums/billing.enum.js';
import { BILLING_CYCLES, type BillingCycle } from '../../../shared/constants/pricing.js';

const CYCLES = Object.keys(BILLING_CYCLES) as BillingCycle[];

/**
 * What the buyer of a thing asks for — never how much it costs.
 *
 * There is deliberately no `amount` field anywhere in this DTO. The server
 * prices every purchase from the rate card using these codes, so the only
 * thing a tampered request can change is *what* is being bought, not what it
 * costs.
 */
export class CheckoutDto {
  @ApiProperty({ enum: PaymentPurpose, description: 'Which revenue stream this purchase belongs to' })
  @IsEnum(PaymentPurpose, { message: 'purpose must be one of: subscription, featured_listing, commission' })
  purpose: PaymentPurpose;

  @ApiPropertyOptional({ enum: PlanTier, description: 'Required for `subscription`' })
  @IsOptional()
  @IsEnum(PlanTier, { message: 'tier must be one of: free, silver, gold' })
  tier?: PlanTier;

  @ApiPropertyOptional({ enum: CYCLES, description: 'Required for `subscription`', example: 'quarterly' })
  @IsOptional()
  @IsIn(CYCLES, { message: `cycle must be one of: ${CYCLES.join(', ')}` })
  cycle?: BillingCycle;

  @ApiPropertyOptional({ description: 'Required for `featured_listing` — the listing to promote' })
  @IsOptional()
  @IsMongoId({ message: 'propertyId must be a valid property ID' })
  propertyId?: string;

  @ApiPropertyOptional({ enum: FeaturedTier, description: 'Required for `featured_listing`' })
  @IsOptional()
  @IsEnum(FeaturedTier, { message: 'pack must be one of: spotlight, premium' })
  pack?: FeaturedTier;

  @ApiPropertyOptional({ description: 'Required for `commission` — the invoice being settled' })
  @IsOptional()
  @IsMongoId({ message: 'commissionId must be a valid commission ID' })
  commissionId?: string;
}
