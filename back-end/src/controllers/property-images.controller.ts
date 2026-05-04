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
import { PropertyImagesService } from '../services/property-images.service.js';
import { CreatePropertyImageDto } from '../property-images/dto/create-property-image.dto.js';
import { UpdatePropertyImageDto } from '../property-images/dto/update-property-image.dto.js';
import { PropertyImageResponseDto } from '../property-images/dto/property-image-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('PropertyImages')
@ApiExtraModels(PropertyImageResponseDto)
@Controller('property-images')
export class PropertyImagesController {
  constructor(private readonly service: PropertyImagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new property-image' })
  @ApiSuccessResponse(PropertyImageResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreatePropertyImageDto) {
    const data = this.service.create(dto);
    return { message: 'PropertyImage created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all property-images' })
  @ApiSuccessResponse(PropertyImageResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'PropertyImages retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property-image by ID' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiSuccessResponse(PropertyImageResponseDto)
  @ApiNotFound('PropertyImage')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'PropertyImage retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a property-image' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiSuccessResponse(PropertyImageResponseDto)
  @ApiNotFound('PropertyImage')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdatePropertyImageDto) {
    const data = this.service.update(id, dto);
    return { message: 'PropertyImage updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a property-image' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiNotFound('PropertyImage')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'PropertyImage deleted successfully', data: null };
  }
}
