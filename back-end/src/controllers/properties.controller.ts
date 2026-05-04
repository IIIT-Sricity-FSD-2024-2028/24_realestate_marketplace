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
import { PropertiesService } from '../services/properties.service.js';
import { CreatePropertyDto } from '../properties/dto/create-property.dto.js';
import { UpdatePropertyDto } from '../properties/dto/update-property.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Properties')
@ApiExtraModels(PropertyResponseDto)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER)
  @ApiOperation({
    summary: 'Create a new property listing',
    description:
      'Agents and admins can create property listings. All required fields must be provided. ' +
      'Price must be positive, bedrooms 0–20, bathrooms 1–20.',
  })
  @ApiSuccessResponse(PropertyResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreatePropertyDto) {
    const data = this.propertiesService.create(dto);
    return { message: 'Property created successfully', data };
  }

  @Get()
  @ApiOperation({
    summary: 'List all properties',
    description: 'Returns all properties. Public endpoint — no role required.',
  })
  @ApiSuccessResponse(PropertyResponseDto, 200, true)
  findAll() {
    const data = this.propertiesService.findAll();
    return { message: 'Properties retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by ID',
    description: 'Returns a single property. Public endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: 'prop_000001' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  findOne(@Param('id') id: string) {
    const data = this.propertiesService.findOne(id);
    return { message: 'Property retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER)
  @ApiOperation({
    summary: 'Update a property',
    description:
      'Partially updates a property. Only send fields to change. Agents and admins only.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: 'prop_000001' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const data = this.propertiesService.update(id, dto);
    return { message: 'Property updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.SELLER)
  @ApiOperation({
    summary: 'Delete a property',
    description: 'Permanently deletes a property listing. Admin-only.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: 'prop_000001' })
  @ApiNotFound('Property')
  remove(@Param('id') id: string) {
    this.propertiesService.remove(id);
    return { message: 'Property deleted successfully', data: null };
  }
}
