import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { VisitsService } from '../services/visits.service.js';
import { CreateVisitDto } from '../visits/dto/create-visit.dto.js';
import { UpdateVisitDto } from '../visits/dto/update-visit.dto.js';
import { VisitResponseDto } from '../visits/dto/visit-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Visits')
@ApiExtraModels(VisitResponseDto)
@Controller('visits')
export class VisitsController {
  constructor(private readonly service: VisitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Create a new visit' })
  @ApiSuccessResponse(VisitResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateVisitDto) {
    const data = this.service.create(dto);
    return { message: 'Visit created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all visits' })
  @ApiSuccessResponse(VisitResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Visits retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visit by ID' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Visit retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Update a visit' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiSuccessResponse(VisitResponseDto)
  @ApiNotFound('Visit')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateVisitDto) {
    const data = this.service.update(id, dto);
    return { message: 'Visit updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Delete a visit' })
  @ApiParam({ name: 'id', description: 'Visit ID' })
  @ApiNotFound('Visit')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Visit deleted successfully', data: null };
  }
}
