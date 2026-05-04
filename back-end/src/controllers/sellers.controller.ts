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
import { SellersService } from '../services/sellers.service.js';
import { CreateSellerDto } from '../sellers/dto/create-seller.dto.js';
import { UpdateSellerDto } from '../sellers/dto/update-seller.dto.js';
import { SellerResponseDto } from '../sellers/dto/seller-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Sellers')
@ApiExtraModels(SellerResponseDto)
@Controller('sellers')
export class SellersController {
  constructor(private readonly service: SellersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new seller' })
  @ApiSuccessResponse(SellerResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateSellerDto) {
    const data = this.service.create(dto);
    return { message: 'Seller created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all sellers' })
  @ApiSuccessResponse(SellerResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Sellers retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiSuccessResponse(SellerResponseDto)
  @ApiNotFound('Seller')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Seller retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a seller' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiSuccessResponse(SellerResponseDto)
  @ApiNotFound('Seller')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateSellerDto) {
    const data = this.service.update(id, dto);
    return { message: 'Seller updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a seller' })
  @ApiParam({ name: 'id', description: 'Seller ID' })
  @ApiNotFound('Seller')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Seller deleted successfully', data: null };
  }
}
