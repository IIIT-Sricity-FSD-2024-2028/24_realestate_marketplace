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
import { PropertyImagesService } from './property-images.service.js';
import { CreatePropertyImageDto } from './dto/create-property-image.dto.js';
import { UpdatePropertyImageDto } from './dto/update-property-image.dto.js';
import { PropertyImageResponseDto } from './dto/property-image-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('PropertyImages')
@ApiExtraModels(PropertyImageResponseDto)
@Controller('property-images')
export class PropertyImagesController {
  constructor(private readonly service: PropertyImagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new property-image' })
  @ApiSuccessResponse(PropertyImageResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreatePropertyImageDto) {
    const data = await this.service.create(dto);
    return { message: 'PropertyImage created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all property-images' })
  @ApiSuccessResponse(PropertyImageResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'PropertyImages retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property-image by ID' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiSuccessResponse(PropertyImageResponseDto)
  @ApiNotFound('PropertyImage')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'PropertyImage retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a property-image' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiSuccessResponse(PropertyImageResponseDto)
  @ApiNotFound('PropertyImage')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyImageDto) {
    const data = await this.service.update(id, dto);
    return { message: 'PropertyImage updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a property-image' })
  @ApiParam({ name: 'id', description: 'PropertyImage ID' })
  @ApiNotFound('PropertyImage')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'PropertyImage deleted successfully', data: null };
  }
}
