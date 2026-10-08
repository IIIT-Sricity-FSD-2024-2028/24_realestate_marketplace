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
import { AdminsService } from './admins.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
import { AdminResponseDto } from './dto/admin-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Admins')
@ApiExtraModels(AdminResponseDto)
@Controller('admins')
export class AdminsController {
  constructor(private readonly service: AdminsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiSuccessResponse(AdminResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateAdminDto) {
    const data = await this.service.create(dto);
    return { message: 'Admin created successfully', data };
  }

  @Get()
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'List all admins' })
  @ApiSuccessResponse(AdminResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'Admins retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiSuccessResponse(AdminResponseDto)
  @ApiNotFound('Admin')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Admin retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiSuccessResponse(AdminResponseDto)
  @ApiNotFound('Admin')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const data = await this.service.update(id, dto);
    return { message: 'Admin updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiNotFound('Admin')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Admin deleted successfully', data: null };
  }
}
