import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { NegotiationsService } from './negotiations.service.js';
import { CreateNegotiationDto, CounterNegotiationDto, RejectNegotiationDto } from './dto/create-negotiation.dto.js';
import { NegotiationResponseDto } from './dto/negotiation-response.dto.js';
import { NegotiationFilterDto } from './dto/negotiation-filter.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Negotiations')
@Controller('negotiations')
export class NegotiationsController {
  constructor(private readonly negotiationsService: NegotiationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Submit an offer on a property',
    description: "Buyer accounts only. Starts in `pending` status, awaiting the seller's response.",
  })
  @ApiSuccessResponse(NegotiationResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateNegotiationDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.create(dto, user);
    return { message: 'Offer submitted successfully', data };
  }

  @Get('mine')
  @ApiRole(Role.USER)
  @ApiOperation({ summary: "List the authenticated buyer's own negotiations" })
  @ApiSuccessResponse(NegotiationResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.findByOwner(user.id);
    return { message: 'Your negotiations retrieved successfully', data };
  }

  @Get('review-queue')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin/superuser negotiation oversight queue (view-only)',
    description:
      'Every negotiation, with buyer and property populated. Filter by status. Every admin sees the ' +
      'same full queue — no per-admin scoping. This queue is strictly READ-ONLY: negotiation is ' +
      'buyer-seller, and only the seller who listed the property may counter/accept/reject (see ' +
      '/negotiations/seller-queue). `propertyHasSeller: false` marks an offer nobody can answer.',
  })
  @ApiSuccessResponse(NegotiationResponseDto, 200, true)
  async findForReview(@Query() filters: NegotiationFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.findForReview(filters, user);
    return { message: 'Negotiations retrieved successfully', data };
  }

  @Get('seller-queue')
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "Seller's negotiation queue",
    description: 'Every negotiation on a property this seller submitted. Seller accounts only.',
  })
  @ApiSuccessResponse(NegotiationResponseDto, 200, true)
  async findForSeller(@Query() filters: NegotiationFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.findForSeller(user, filters);
    return { message: 'Negotiations retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get a negotiation by ID',
    description: 'Admins/superusers can view any negotiation; buyers may only view their own.',
  })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.findOne(id, user);
    return { message: 'Negotiation retrieved successfully', data };
  }

  @Patch(':id/counter')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Counter-offer a pending negotiation',
    description: 'Only the seller who listed the property may respond. Admins never negotiate price.',
  })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  @ApiValidationError()
  async counter(@Param('id') id: string, @Body() dto: CounterNegotiationDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.counter(id, dto, user);
    return { message: 'Counter-offer sent', data };
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "Accept the buyer's offer as-is",
    description:
      "Only the seller who listed the property may respond. Creates a Purchase at the buyer's " +
      'offer amount, which the buyer then initiates and the admin drives step by step.',
  })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  async accept(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.acceptOffer(id, user);
    return { message: 'Offer accepted — purchase created', data };
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Reject a negotiation',
    description: 'Only the seller who listed the property may respond. Admins never negotiate price.',
  })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  @ApiValidationError()
  async reject(@Param('id') id: string, @Body() dto: RejectNegotiationDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.reject(id, dto, user);
    return { message: 'Negotiation rejected', data };
  }

  @Patch(':id/accept-counter')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "Accept the seller's counter-offer",
    description: 'Buyer (owner) only. Creates a Purchase at the counter-offer amount.',
  })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  async acceptCounter(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.acceptCounterByBuyer(id, user);
    return { message: 'Counter-offer accepted — purchase created', data };
  }

  @Patch(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER)
  @ApiOperation({ summary: 'Withdraw your own offer', description: 'Buyer (owner) only.' })
  @ApiParam({ name: 'id', description: 'Negotiation ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  async withdraw(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.negotiationsService.withdraw(id, user);
    return { message: 'Offer withdrawn', data };
  }
}
