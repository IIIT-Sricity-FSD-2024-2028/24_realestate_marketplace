import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { VisitsService } from './visits.service.js';
import { CreateVisitDto, RescheduleVisitDto, CancelVisitDto } from './dto/create-visit.dto.js';
import { VisitResponseDto } from './dto/visit-response.dto.js';
import { VisitFilterDto } from './dto/visit-filter.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Visits')
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Request a site visit on a property',
    description:
      'Buyer accounts only. Starts in `pending` status, awaiting any admin to confirm — site visits ' +
      'are handled by the admin, not the seller.',
  })
  @ApiSuccessResponse(VisitResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateVisitDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.create(dto, user);
    return { message: 'Visit requested successfully', data };
  }

  @Get('mine')
  @ApiRole(Role.USER)
  @ApiOperation({ summary: "List the authenticated buyer's own visit requests" })
  @ApiSuccessResponse(VisitResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.findByOwner(user.id);
    return { message: 'Your visits retrieved successfully', data };
  }

  @Get('review-queue')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin/superuser visit queue',
    description:
      'Every visit request, with buyer and property populated. Every admin sees the same full ' +
      'queue — every item here is one any admin may act on.',
  })
  @ApiSuccessResponse(VisitResponseDto, 200, true)
  async findForReview(@Query() filters: VisitFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.findForReview(user, filters);
    return { message: 'Visits retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.USER)
  @ApiOperation({ summary: 'Get a visit by ID', description: 'Buyer (owner) only.' })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.findOne(id, user);
    return { message: 'Visit retrieved successfully', data };
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Confirm a pending visit request',
    description: 'Any admin (or superuser) may respond — no per-admin restriction.',
  })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  async confirm(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.confirm(id, user);
    return { message: 'Visit confirmed', data };
  }

  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Propose a new date/time for a visit',
    description: 'Any admin (or superuser) may respond — no per-admin restriction.',
  })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  @ApiValidationError()
  async reschedule(@Param('id') id: string, @Body() dto: RescheduleVisitDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.reschedule(id, dto, user);
    return { message: 'Visit rescheduled', data };
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Mark a visit as completed',
    description: 'Any admin (or superuser) may respond — no per-admin restriction.',
  })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  async complete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.complete(id, user);
    return { message: 'Visit marked completed', data };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Cancel a visit',
    description: 'The requesting buyer, or any admin, may cancel.',
  })
  @ApiParam({ name: 'id', description: 'Visit ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  @ApiValidationError()
  async cancel(@Param('id') id: string, @Body() dto: CancelVisitDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.visitsService.cancel(id, dto, user);
    return { message: 'Visit cancelled', data };
  }
}
