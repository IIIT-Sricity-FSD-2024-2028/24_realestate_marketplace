import { Controller, Get, Patch, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service.js';
import { PurchaseResponseDto } from './dto/purchase-response.dto.js';
import { PurchaseFilterDto } from './dto/purchase-filter.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('mine')
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "List the authenticated buyer's own purchases",
    description: 'Every purchase created from one of this buyer\'s accepted negotiations, with deal-step progress.',
  })
  @ApiSuccessResponse(PurchaseResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.findByOwner(user.id);
    return { message: 'Your purchases retrieved successfully', data };
  }

  @Get('review-queue')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin/superuser purchase tracking queue',
    description:
      'Every purchase, with buyer and property populated. Filter by dealStatus. Every admin sees ' +
      'the same full queue — no per-admin scoping.',
  })
  @ApiSuccessResponse(PurchaseResponseDto, 200, true)
  async findForReview(@Query() filters: PurchaseFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.findForReview(filters, user);
    return { message: 'Purchases retrieved successfully', data };
  }

  @Get('seller-queue')
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: "Seller's purchase tracking queue (read-only)",
    description: 'Every purchase on a property this seller submitted. Seller accounts only.',
  })
  @ApiSuccessResponse(PurchaseResponseDto, 200, true)
  async findForSeller(@Query() filters: PurchaseFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.findForSeller(user, filters);
    return { message: 'Purchases retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get a purchase by ID',
    description: 'Admins/superusers can view any purchase; buyers may only view their own.',
  })
  @ApiParam({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PurchaseResponseDto)
  @ApiNotFound('Purchase')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.findOne(id, user);
    return { message: 'Purchase retrieved successfully', data };
  }

  @Patch(':id/advance')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Advance a purchase to its next deal step',
    description:
      'Moves through: Offer Accepted → Document Verification → Token Payment → Full Payment → Registration. ' +
      'Advancing past Registration marks the deal completed. Admin/superuser only.',
  })
  @ApiParam({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PurchaseResponseDto)
  @ApiNotFound('Purchase')
  async advance(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.advance(id, user);
    return { message: 'Purchase advanced to the next step', data };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel a purchase', description: 'Admin/superuser only.' })
  @ApiParam({ name: 'id', description: 'Purchase ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PurchaseResponseDto)
  @ApiNotFound('Purchase')
  async cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.purchasesService.cancel(id, user);
    return { message: 'Purchase cancelled', data };
  }
}
