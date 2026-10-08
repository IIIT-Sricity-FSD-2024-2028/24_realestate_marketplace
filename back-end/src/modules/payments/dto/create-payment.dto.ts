import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * What a completed checkout hands back for server-side verification.
 *
 * The field names mirror Razorpay's checkout handler payload
 * (`razorpay_order_id` / `razorpay_payment_id` / `razorpay_signature`) so the
 * frontend can forward the widget's response with no translation layer.
 *
 * Note there is no `amount` here, by design — the amount is whatever the
 * server recorded when it opened the order, never a number the client sends.
 */
export class VerifyPaymentDto {
  @ApiProperty({ description: 'Gateway order id returned by /billing/checkout', example: 'order_NcL9k2Xp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orderId: string;

  @ApiProperty({ description: 'Gateway payment id from the checkout widget', example: 'pay_NcLA3mQ1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  paymentId: string;

  @ApiProperty({ description: 'HMAC-SHA256 signature over `orderId|paymentId`' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  signature: string;
}

/** Abandoned or declined checkout — recorded so the funnel stays honest. */
export class FailPaymentDto {
  @ApiProperty({ example: 'order_NcL9k2Xp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orderId: string;

  @ApiProperty({ required: false, example: 'Payment cancelled by user' })
  @IsString()
  @MaxLength(200)
  reason: string;
}
