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
import { ShortlistsService } from './shortlists.service.js';
import { CreateShortlistDto } from './dto/create-shortlist.dto.js';
import { UpdateShortlistDto } from './dto/update-shortlist.dto.js';
import { ShortlistResponseDto } from './dto/shortlist-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Shortlists')
@ApiExtraModels(ShortlistResponseDto)
@Controller('shortlists')
export class ShortlistsController {
  constructor(private readonly service: ShortlistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new shortlist' })
  @ApiSuccessResponse(ShortlistResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateShortlistDto) {
    const data = await this.service.create(dto);
    return { message: 'Shortlist created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all shortlists' })
  @ApiSuccessResponse(ShortlistResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'Shortlists retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shortlist by ID' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiSuccessResponse(ShortlistResponseDto)
  @ApiNotFound('Shortlist')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Shortlist retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a shortlist' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiSuccessResponse(ShortlistResponseDto)
  @ApiNotFound('Shortlist')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateShortlistDto) {
    const data = await this.service.update(id, dto);
    return { message: 'Shortlist updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a shortlist' })
  @ApiParam({ name: 'id', description: 'Shortlist ID' })
  @ApiNotFound('Shortlist')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Shortlist deleted successfully', data: null };
  }
}
