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
import { PropertyDocumentsService } from './property-documents.service.js';
import { CreatePropertyDocumentDto } from './dto/create-property-document.dto.js';
import { UpdatePropertyDocumentDto } from './dto/update-property-document.dto.js';
import { PropertyDocumentResponseDto } from './dto/property-document-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('PropertyDocuments')
@ApiExtraModels(PropertyDocumentResponseDto)
@Controller('property-documents')
export class PropertyDocumentsController {
  constructor(private readonly service: PropertyDocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new property-document' })
  @ApiSuccessResponse(PropertyDocumentResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreatePropertyDocumentDto) {
    const data = await this.service.create(dto);
    return { message: 'PropertyDocument created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all property-documents' })
  @ApiSuccessResponse(PropertyDocumentResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'PropertyDocuments retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property-document by ID' })
  @ApiParam({ name: 'id', description: 'PropertyDocument ID' })
  @ApiSuccessResponse(PropertyDocumentResponseDto)
  @ApiNotFound('PropertyDocument')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'PropertyDocument retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a property-document' })
  @ApiParam({ name: 'id', description: 'PropertyDocument ID' })
  @ApiSuccessResponse(PropertyDocumentResponseDto)
  @ApiNotFound('PropertyDocument')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDocumentDto) {
    const data = await this.service.update(id, dto);
    return { message: 'PropertyDocument updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a property-document' })
  @ApiParam({ name: 'id', description: 'PropertyDocument ID' })
  @ApiNotFound('PropertyDocument')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'PropertyDocument deleted successfully', data: null };
  }
}
