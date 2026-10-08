import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentPurpose, PaymentStatus } from '../../../shared/enums/billing.enum.js';

export class PaymentResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  userId: string | null;

  @ApiProperty({ enum: PaymentPurpose, example: PaymentPurpose.SUBSCRIPTION })
  purpose: PaymentPurpose;

  @ApiProperty({ example: 'Gold plan — 3 months' })
  description: string;

  @ApiProperty({ description: 'Amount before GST (₹)', example: 6747 })
  baseAmount: number;

  @ApiProperty({ description: 'GST charged (₹)', example: 1214 })
  taxAmount: number;

  @ApiProperty({ description: 'Total charged (₹)', example: 7961 })
  amount: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  status: PaymentStatus;

  @ApiProperty({ example: 'TRU-SUB-8F2A19' })
  receipt: string;

  @ApiProperty({ example: 'mock' })
  gateway: string;

  @ApiProperty({ example: 'order_NcL9k2Xp' })
  gatewayOrderId: string;

  @ApiProperty({ example: 'pay_NcLA3mQ1', nullable: true })
  gatewayPaymentId: string | null;

  @ApiProperty({ type: Object, example: { tier: 'gold', cycle: 'quarterly' } })
  metadata: Record<string, unknown>;

  @ApiProperty({ example: null, nullable: true })
  failureReason: string | null;

  @ApiProperty({ example: '2026-08-28T09:19:55.704+05:30', nullable: true })
  paidAt: string | null;

  @ApiPropertyOptional({ description: 'Populated on the superuser revenue ledger' })
  payerName?: string;

  @ApiPropertyOptional()
  payerEmail?: string;

  @ApiProperty({ example: '2026-08-28T09:19:55.704+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-28T09:19:55.704+05:30' })
  updatedAt: string;
}

/** What the frontend needs to open the checkout widget. */
export class CheckoutOrderDto {
  @ApiProperty({ example: 'order_NcL9k2Xp' })
  orderId: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  paymentId: string;

  @ApiProperty({ description: 'Total payable (₹)', example: 7961 })
  amount: number;

  @ApiProperty({ example: 6747 })
  baseAmount: number;

  @ApiProperty({ example: 1214 })
  taxAmount: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ description: 'Publishable gateway key for the checkout widget' })
  keyId: string;

  @ApiProperty({ example: 'mock', description: '`mock` renders the built-in demo checkout; `razorpay` loads their widget' })
  gateway: string;

  @ApiProperty({ description: 'False for the mock driver and Razorpay test keys — the UI shows a TEST MODE banner' })
  isLive: boolean;

  @ApiProperty({ example: 'Gold plan — 3 months' })
  description: string;

  @ApiProperty({ example: 'TRU-SUB-8F2A19' })
  receipt: string;
}
