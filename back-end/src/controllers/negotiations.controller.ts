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
import { NegotiationsService } from '../services/negotiations.service.js';
import { CreateNegotiationDto } from '../negotiations/dto/create-negotiation.dto.js';
import { UpdateNegotiationDto } from '../negotiations/dto/update-negotiation.dto.js';
import { NegotiationResponseDto } from '../negotiations/dto/negotiation-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Negotiations')
@ApiExtraModels(NegotiationResponseDto)
@Controller('negotiations')
export class NegotiationsController {
  constructor(private readonly service: NegotiationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Create a new negotiation' })
  @ApiSuccessResponse(NegotiationResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateNegotiationDto) {
    const data = this.service.create(dto);
    return { message: 'Negotiation created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all negotiations' })
  @ApiSuccessResponse(NegotiationResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Negotiations retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get negotiation by ID' })
  @ApiParam({ name: 'id', description: 'Negotiation ID' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Negotiation retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Update a negotiation' })
  @ApiParam({ name: 'id', description: 'Negotiation ID' })
  @ApiSuccessResponse(NegotiationResponseDto)
  @ApiNotFound('Negotiation')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateNegotiationDto) {
    const data = this.service.update(id, dto);
    return { message: 'Negotiation updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Delete a negotiation' })
  @ApiParam({ name: 'id', description: 'Negotiation ID' })
  @ApiNotFound('Negotiation')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Negotiation deleted successfully', data: null };
  }
}
