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
import { ShortlistsService } from '../services/shortlists.service.js';
import { CreateShortlistDto } from '../shortlists/dto/create-shortlist.dto.js';
import { UpdateShortlistDto } from '../shortlists/dto/update-shortlist.dto.js';
import { ShortlistResponseDto } from '../shortlists/dto/shortlist-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Shortlists')
@ApiExtraModels(ShortlistResponseDto)
@Controller('shortlists')
export class ShortlistsController {
  constructor(private readonly service: ShortlistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Create a new shortlist' })
  @ApiSuccessResponse(ShortlistResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateShortlistDto) {
    const data = this.service.create(dto);
    return { message: 'Shortlist created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all shortlists' })
  @ApiSuccessResponse(ShortlistResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Shortlists retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shortlist by ID' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiSuccessResponse(ShortlistResponseDto)
  @ApiNotFound('Shortlist')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Shortlist retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Update a shortlist' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiSuccessResponse(ShortlistResponseDto)
  @ApiNotFound('Shortlist')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateShortlistDto) {
    const data = this.service.update(id, dto);
    return { message: 'Shortlist updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({ summary: 'Delete a shortlist' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiNotFound('Shortlist')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Shortlist deleted successfully', data: null };
  }
}
