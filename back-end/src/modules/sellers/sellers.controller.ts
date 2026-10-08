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
import { SellersService } from './sellers.service.js';
import { CreateSellerDto } from './dto/create-seller.dto.js';
import { UpdateSellerDto } from './dto/update-seller.dto.js';
import { SellerResponseDto } from './dto/seller-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Sellers')
@ApiExtraModels(SellerResponseDto)
@Controller('sellers')
export class SellersController {
  constructor(private readonly service: SellersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new seller' })
  @ApiSuccessResponse(SellerResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateSellerDto) {
    const data = await this.service.create(dto);
    return { message: 'Seller created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all sellers' })
  @ApiSuccessResponse(SellerResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'Sellers retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiSuccessResponse(SellerResponseDto)
  @ApiNotFound('Seller')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Seller retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a seller' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiSuccessResponse(SellerResponseDto)
  @ApiNotFound('Seller')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateSellerDto) {
    const data = await this.service.update(id, dto);
    return { message: 'Seller updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a seller' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiNotFound('Seller')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Seller deleted successfully', data: null };
  }
}
