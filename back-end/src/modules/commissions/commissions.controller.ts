import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service.js';
import { CommissionResponseDto } from './dto/commission-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { ApiSuccessResponse, ApiNotFound } from '../../common/decorators/api-response.decorator.js';

export class WaiveCommissionDto {
  @ApiPropertyOptional({ example: 'Goodwill — first deal for this seller', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly service: CommissionsService) {}

  @Get('mine')
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Commission invoices owed by the authenticated account',
    description:
      'Both sides of the book for this account: what is still owed on closed deals and what has ' +
      'already been settled. Buyers and sellers each see only their own lines.',
  })
  @ApiSuccessResponse(CommissionResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.service.findByParty(user.id);
    return { message: 'Commission invoices retrieved successfully', data };
  }

  @Get()
  @ApiRole(Role.SUPERUSER)
  @ApiOperation({
    summary: 'Platform-wide commission book',
    description: 'Every accrued, settled and waived commission line. Superuser only.',
  })
  @ApiSuccessResponse(CommissionResponseDto, 200, true)
  async findAll(@Query('limit') limit?: string) {
    const parsed = Number(limit);
    const data = await this.service.findAll(
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100,
    );
    return { message: 'Commissions retrieved successfully', data };
  }

  @Patch(':id/reinstate')
  @ApiRole(Role.SUPERUSER)
  @ApiOperation({
    summary: 'Undo a write-off, making the invoice payable again',
    description:
      'Superuser only. Puts a `waived` line back to `accrued` with its original amount and rate ' +
      'intact, so the party can settle it through the normal checkout. A settled commission ' +
      'cannot be reinstated.',
  })
  @ApiParam({ name: 'id', description: 'Commission ID' })
  @ApiSuccessResponse(CommissionResponseDto)
  @ApiNotFound('Commission')
  async reinstate(@Param('id') id: string) {
    const data = await this.service.reinstate(id);
    return { message: 'Commission reinstated — it is payable again', data };
  }

  @Patch(':id/waive')
  @ApiRole(Role.SUPERUSER)
  @ApiOperation({
    summary: 'Write off a commission line',
    description:
      'Superuser only. The line stays on the books marked `waived`, so written-off revenue is ' +
      'visible in the report rather than silently disappearing.',
  })
  @ApiParam({ name: 'id', description: 'Commission ID' })
  @ApiSuccessResponse(CommissionResponseDto)
  @ApiNotFound('Commission')
  async waive(@Param('id') id: string, @Body() dto: WaiveCommissionDto) {
    const data = await this.service.waive(id, dto.reason ?? '');
    return { message: 'Commission waived', data };
  }
}
