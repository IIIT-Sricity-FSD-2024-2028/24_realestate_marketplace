import { Body, Controller, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { BillingService } from './billing.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { BillingSummaryDto, CatalogResponseDto, RevenueReportDto } from './dto/billing-response.dto.js';
import { PaymentsService } from '../payments/payments.service.js';
import { CheckoutOrderDto, PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { FailPaymentDto, VerifyPaymentDto } from '../payments/dto/create-payment.dto.js';
import { SubscriptionResponseDto } from '../subscriptions/dto/subscription-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { ApiSuccessResponse, ApiValidationError } from '../../common/decorators/api-response.decorator.js';

/**
 * Everything money-facing that a dashboard talks to.
 *
 * The checkout flow is three calls, mirroring how a real gateway works:
 *   POST /billing/checkout  -> server prices it and opens an order
 *   (the customer pays in the gateway's widget)
 *   POST /billing/verify    -> server checks the signature and grants it
 */
@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('catalog')
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'The published rate card',
    description:
      'Plans, promotion packs, commission rates and GST — plus which gateway driver is active. ' +
      'Dashboards render prices from this so the displayed price and the charged price cannot drift.',
  })
  @ApiSuccessResponse(CatalogResponseDto)
  catalog() {
    return { message: 'Catalog retrieved successfully', data: this.billingService.catalog() };
  }

  @Get('summary')
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "The authenticated account's billing page, in one call",
    description:
      'Sellers get their plan, quota usage and promotable listings; both buyers and sellers get ' +
      'their commission invoices, outstanding balance and payment history.',
  })
  @ApiSuccessResponse(BillingSummaryDto)
  async summary(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.billingService.summary(user);
    return { message: 'Billing summary retrieved successfully', data };
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Open a payment order',
    description:
      'Prices the purchase server-side from the rate card and opens an order with the active ' +
      'gateway. Nothing is granted at this point — the order still has to be paid and verified.',
  })
  @ApiSuccessResponse(CheckoutOrderDto, 201)
  @ApiValidationError()
  async checkout(@Body() dto: CheckoutDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.billingService.checkout(dto, user);
    return { message: 'Payment order created', data };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Verify a completed payment and unlock what was bought',
    description:
      'Checks the HMAC signature against the order, marks the payment paid, then activates the ' +
      'plan / promotes the listing / settles the invoice. An unverifiable signature grants nothing.',
  })
  @ApiSuccessResponse(PaymentResponseDto)
  @ApiValidationError()
  async verifyPayment(@Body() dto: VerifyPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    const { payment, unlocked } = await this.billingService.verify(dto, user);
    return { message: unlocked, data: payment };
  }

  @Post('cancelled')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Record an abandoned or declined checkout',
    description: 'Keeps the funnel honest — an unpaid order is marked failed rather than left open.',
  })
  @ApiSuccessResponse(PaymentResponseDto)
  async cancelled(@Body() dto: FailPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.paymentsService.markFailed(dto.orderId, user.id, dto.reason);
    return { message: 'Payment cancelled', data };
  }

  /**
   * Stands in for the hosted checkout widget when the offline driver is
   * active — it returns the same paymentId + signature Razorpay's widget
   * would have. Refuses outright once real keys are configured, so the demo
   * path can never be used to fake a live payment.
   */
  @Post('demo-checkout/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Offline gateway only — simulate paying an order',
    description:
      'Returns a genuine HMAC signature for the order, which the client then submits to ' +
      '/billing/verify exactly as it would a real one. Disabled when Razorpay keys are set.',
  })
  @ApiParam({ name: 'orderId', description: 'Gateway order id from /billing/checkout' })
  simulate(@Param('orderId') orderId: string) {
    return {
      message: 'Demo payment authorised',
      data: this.paymentsService.simulateCheckout(orderId),
    };
  }

  @Patch('subscription/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Cancel the active listing plan',
    description: 'The seller drops to the free Starter tier and its listing quota immediately.',
  })
  @ApiSuccessResponse(SubscriptionResponseDto)
  async cancelSubscription(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.billingService.cancelSubscription(user);
    return { message: 'Plan cancelled — you are back on the free Starter plan', data };
  }

  @Get('revenue')
  @ApiRole(Role.SUPERUSER)
  @ApiOperation({
    summary: 'Platform revenue report',
    description:
      'Superuser only. Collected revenue by stream and by month, commission receivable, MRR from ' +
      'live plans, revenue per city, and the checkout conversion funnel.',
  })
  @ApiSuccessResponse(RevenueReportDto)
  async revenue() {
    const data = await this.billingService.revenueReport();
    return { message: 'Revenue report retrieved successfully', data };
  }
}
