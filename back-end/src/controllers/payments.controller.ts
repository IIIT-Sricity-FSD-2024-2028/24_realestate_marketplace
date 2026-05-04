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
import { PaymentsService } from '../services/payments.service.js';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto.js';
import { UpdatePaymentDto } from '../payments/dto/update-payment.dto.js';
import { PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Payments')
@ApiExtraModels(PaymentResponseDto)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiSuccessResponse(PaymentResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreatePaymentDto) {
    const data = this.service.create(dto);
    return { message: 'Payment created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  @ApiSuccessResponse(PaymentResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Payments retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiSuccessResponse(PaymentResponseDto)
  @ApiNotFound('Payment')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Payment retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiSuccessResponse(PaymentResponseDto)
  @ApiNotFound('Payment')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    const data = this.service.update(id, dto);
    return { message: 'Payment updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiNotFound('Payment')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Payment deleted successfully', data: null };
  }
}
