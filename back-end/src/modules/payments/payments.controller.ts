import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { PaymentResponseDto } from './dto/payment-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { ApiSuccessResponse, ApiNotFound } from '../../common/decorators/api-response.decorator.js';

/** Nest attaches this when the app is created with `rawBody: true` (see main.ts). */
type RawBodyRequest = Request & { rawBody?: Buffer };

interface RazorpayWebhookBody {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
}

/**
 * Read access to the payment ledger, plus the gateway webhook.
 *
 * Paying for something is *not* here — that lives on `/billing/checkout`,
 * because the price of a thing is a billing decision, not a payments one.
 */
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('mine')
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: "The authenticated account's own payment history",
    description: 'Every order this account opened, paid or not, newest first.',
  })
  @ApiSuccessResponse(PaymentResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.service.findByUser(user.id);
    return { message: 'Payment history retrieved successfully', data };
  }

  @Get()
  @ApiRole(Role.SUPERUSER)
  @ApiOperation({
    summary: 'Platform-wide payment ledger',
    description:
      'Superuser only — this is the money trail for the whole platform, so it is deliberately ' +
      'not exposed to city admins.',
  })
  @ApiSuccessResponse(PaymentResponseDto, 200, true)
  async findAll(@Query('limit') limit?: string) {
    const parsed = Number(limit);
    const data = await this.service.findAll(Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100);
    return { message: 'Payments retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a payment (receipt) by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiSuccessResponse(PaymentResponseDto)
  @ApiNotFound('Payment')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.service.findOne(id);
    // A receipt is only ever the payer's, or the superuser's to audit.
    if (user.role !== Role.SUPERUSER && data.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this payment');
    }
    return { message: 'Payment retrieved successfully', data };
  }

  /**
   * Gateway webhook — the safety net.
   *
   * The normal path is the browser posting back to /billing/verify. If the
   * customer closes the tab after paying, that never happens and the order
   * would sit CREATED forever despite the money having moved. Razorpay
   * retries this endpoint until it gets a 2xx, so the payment still lands.
   *
   * Unauthenticated by necessity (the gateway holds no JWT) — the signature
   * over the *raw* body is what authenticates it, which is why main.ts
   * enables `rawBody`. Re-serialising the parsed body would change the bytes
   * and break every signature.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: RazorpayWebhookBody,
  ) {
    const raw = req.rawBody?.toString('utf8');
    if (!raw || !signature || !this.service.verifyWebhook(raw, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }
    const entity = body?.payload?.payment?.entity;
    if (body?.event === 'payment.captured' && entity?.order_id) {
      await this.service.captureFromWebhook(entity.order_id, entity.id ?? 'unknown');
    }
    // Always 200 on a verified webhook — a non-2xx makes the gateway retry an
    // event we have already handled.
    return { message: 'Webhook processed', data: null };
  }
}
