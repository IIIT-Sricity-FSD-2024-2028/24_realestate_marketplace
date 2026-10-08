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
import { BuyersService } from './buyers.service.js';
import { CreateBuyerDto } from './dto/create-buyer.dto.js';
import { UpdateBuyerDto } from './dto/update-buyer.dto.js';
import { BuyerResponseDto } from './dto/buyer-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Buyers')
@ApiExtraModels(BuyerResponseDto)
@Controller('buyers')
export class BuyersController {
  constructor(private readonly service: BuyersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new buyer' })
  @ApiSuccessResponse(BuyerResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateBuyerDto) {
    const data = await this.service.create(dto);
    return { message: 'Buyer created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all buyers' })
  @ApiSuccessResponse(BuyerResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'Buyers retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get buyer by ID' })
  @ApiParam({ name: 'id', description: 'Buyer ID' })
  @ApiSuccessResponse(BuyerResponseDto)
  @ApiNotFound('Buyer')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Buyer retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a buyer' })
  @ApiParam({ name: 'id', description: 'Buyer ID' })
  @ApiSuccessResponse(BuyerResponseDto)
  @ApiNotFound('Buyer')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateBuyerDto) {
    const data = await this.service.update(id, dto);
    return { message: 'Buyer updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a buyer' })
  @ApiParam({ name: 'id', description: 'Buyer ID' })
  @ApiNotFound('Buyer')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Buyer deleted successfully', data: null };
  }
}
