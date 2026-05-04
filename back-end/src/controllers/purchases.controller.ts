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
import { PurchasesService } from '../services/purchases.service.js';
import { CreatePurchaseDto } from '../purchases/dto/create-purchase.dto.js';
import { UpdatePurchaseDto } from '../purchases/dto/update-purchase.dto.js';
import { PurchaseResponseDto } from '../purchases/dto/purchase-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Purchases')
@ApiExtraModels(PurchaseResponseDto)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiSuccessResponse(PurchaseResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreatePurchaseDto) {
    const data = this.service.create(dto);
    return { message: 'Purchase created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all purchases' })
  @ApiSuccessResponse(PurchaseResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Purchases retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiSuccessResponse(PurchaseResponseDto)
  @ApiNotFound('Purchase')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Purchase retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiSuccessResponse(PurchaseResponseDto)
  @ApiNotFound('Purchase')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    const data = this.service.update(id, dto);
    return { message: 'Purchase updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiNotFound('Purchase')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Purchase deleted successfully', data: null };
  }
}
