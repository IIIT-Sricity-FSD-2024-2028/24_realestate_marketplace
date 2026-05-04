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
import { AdminsService } from '../services/admins.service.js';
import { CreateAdminDto } from '../admins/dto/create-admin.dto.js';
import { UpdateAdminDto } from '../admins/dto/update-admin.dto.js';
import { AdminResponseDto } from '../admins/dto/admin-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Admins')
@ApiExtraModels(AdminResponseDto)
@Controller('admins')
export class AdminsController {
  constructor(private readonly service: AdminsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiSuccessResponse(AdminResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateAdminDto) {
    const data = this.service.create(dto);
    return { message: 'Admin created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all admins' })
  @ApiSuccessResponse(AdminResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Admins retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiSuccessResponse(AdminResponseDto)
  @ApiNotFound('Admin')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Admin retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiSuccessResponse(AdminResponseDto)
  @ApiNotFound('Admin')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const data = this.service.update(id, dto);
    return { message: 'Admin updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a admin' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiNotFound('Admin')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Admin deleted successfully', data: null };
  }
}
