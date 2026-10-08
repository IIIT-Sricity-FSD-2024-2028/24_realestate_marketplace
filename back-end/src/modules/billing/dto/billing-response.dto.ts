import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto.js';
import { CommissionResponseDto } from '../../commissions/dto/commission-response.dto.js';
import { SubscriptionResponseDto } from '../../subscriptions/dto/subscription-response.dto.js';
import { PropertyResponseDto } from '../../properties/dto/property-response.dto.js';

/** The published rate card, so the dashboards never hard-code a price. */
export class CatalogResponseDto {
  @ApiProperty({ type: [Object], description: 'Seller listing plans, cheapest first' })
  plans: unknown[];

  @ApiProperty({ type: [Object], description: 'Billing cycles and their commitment discounts' })
  cycles: unknown[];

  @ApiProperty({ type: [Object], description: 'Paid promotion packs for a single listing' })
  featuredPacks: unknown[];

  @ApiProperty({ description: 'Commission rates in basis points, by listing type' })
  commission: unknown;

  @ApiProperty({ example: 18, description: 'GST percentage applied to platform fees' })
  gstPercent: number;

  @ApiProperty({ example: 'mock', description: 'Active gateway driver' })
  gateway: string;

  @ApiProperty({ example: false, description: 'False on the mock driver and on Razorpay test keys' })
  isLive: boolean;
}

/** Everything a seller's or buyer's Billing page needs, in one request. */
export class BillingSummaryDto {
  @ApiPropertyOptional({ type: SubscriptionResponseDto, description: 'Sellers only' })
  plan?: SubscriptionResponseDto;

  @ApiPropertyOptional({ type: [PropertyResponseDto], description: 'Sellers only — listings that can be promoted' })
  listings?: PropertyResponseDto[];

  @ApiProperty({ type: [CommissionResponseDto], description: 'Commission invoices owed by this account' })
  commissions: CommissionResponseDto[];

  @ApiProperty({ description: 'Total still owed across unpaid commission invoices (₹)', example: 150450 })
  amountDue: number;

  @ApiProperty({ description: 'Total this account has paid the platform to date (₹)', example: 8961 })
  lifetimeSpend: number;

  @ApiProperty({ type: [PaymentResponseDto], description: 'Payment history, newest first' })
  payments: PaymentResponseDto[];
}

/** The superuser revenue report. */
export class RevenueReportDto {
  @ApiProperty({ description: 'Cash actually collected, all streams (₹)', example: 312450 })
  totalCollected: number;

  @ApiProperty({ description: 'Commission earned but not yet settled (₹)', example: 150450 })
  receivable: number;

  @ApiProperty({ description: 'Normalised monthly recurring revenue from live plans (₹)', example: 12489 })
  mrr: number;

  @ApiProperty({ description: 'Commission written off (₹)', example: 0 })
  waived: number;

  @ApiProperty({ description: 'Collected revenue split by stream' })
  byStream: unknown;

  @ApiProperty({ type: [Object], description: 'Collected revenue per month, oldest first' })
  monthly: unknown[];

  @ApiProperty({ type: [Object], description: 'Commission earned per city' })
  byCity: unknown[];

  @ApiProperty({ description: 'Live paid subscriptions per tier' })
  subscriptions: unknown;

  @ApiProperty({ description: 'Checkout funnel: orders opened vs paid vs failed' })
  checkoutFunnel: unknown;

  @ApiProperty({ type: [PaymentResponseDto], description: 'Most recent transactions' })
  recentPayments: PaymentResponseDto[];
}
