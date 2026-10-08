import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Bookings')
@ApiExtraModels(BookingResponseDto)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a property viewing booking',
    description:
      'Buyers and admins can book a viewing appointment. ' +
      'The property must exist. Booking date/time must be in the future. ' +
      'Duplicate bookings (same buyer, property, date, time) are rejected.',
  })
  @ApiSuccessResponse(BookingResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateBookingDto) {
    const data = await this.bookingsService.create(dto);
    return { message: 'Booking created successfully', data };
  }

  @Get()
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'List all bookings',
    description: 'Returns all bookings in the system. Admin-only.',
  })
  @ApiQuery({
    name: 'buyerId',
    required: false,
    description: 'Filter bookings by buyer ID',
    example: 'usr_000003',
  })
  @ApiSuccessResponse(BookingResponseDto, 200, true)
  async findAll(@Query('buyerId') buyerId?: string) {
    const data = buyerId
      ? await this.bookingsService.findByBuyer(buyerId)
      : await this.bookingsService.findAll();
    return { message: 'Bookings retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Returns a single booking by ID. All authenticated roles can access.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiSuccessResponse(BookingResponseDto)
  @ApiNotFound('Booking')
  async findOne(@Param('id') id: string) {
    const data = await this.bookingsService.findOne(id);
    return { message: 'Booking retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Update booking status or notes',
    description:
      'Admins can update booking status (pending → confirmed → completed) ' +
      'and notes. Cannot change status of completed bookings.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiSuccessResponse(BookingResponseDto)
  @ApiNotFound('Booking')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const data = await this.bookingsService.update(id, dto);
    return { message: 'Booking updated successfully', data };
  }

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Cancel a booking',
    description:
      'Cancels a pending or confirmed booking. ' +
      'Cannot cancel completed bookings or already-cancelled bookings.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiNotFound('Booking')
  async cancel(@Param('id') id: string) {
    const data = await this.bookingsService.cancel(id);
    return { message: 'Booking cancelled successfully', data };
  }
}
