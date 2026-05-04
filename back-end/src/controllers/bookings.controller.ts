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
import { BookingsService } from '../services/bookings.service.js';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto.js';
import { UpdateBookingDto } from '../bookings/dto/update-booking.dto.js';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Bookings')
@ApiExtraModels(BookingResponseDto)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.BUYER, Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({
    summary: 'Create a property viewing booking',
    description:
      'Buyers and admins can book a viewing appointment. ' +
      'The property must exist. Booking date/time must be in the future. ' +
      'Duplicate bookings (same buyer, property, date, time) are rejected.',
  })
  @ApiSuccessResponse(BookingResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateBookingDto) {
    const data = this.bookingsService.create(dto);
    return { message: 'Booking created successfully', data };
  }

  @Get()
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER)
  @ApiOperation({
    summary: 'List all bookings',
    description: 'Returns all bookings in the system. Admins and agents only.',
  })
  @ApiQuery({
    name: 'buyerId',
    required: false,
    description: 'Filter bookings by buyer ID',
    example: 'usr_000003',
  })
  @ApiSuccessResponse(BookingResponseDto, 200, true)
  findAll(@Query('buyerId') buyerId?: string) {
    const data = buyerId
      ? this.bookingsService.findByBuyer(buyerId)
      : this.bookingsService.findAll();
    return { message: 'Bookings retrieved successfully', data };
  }

  @Get(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.BUYER)
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Returns a single booking by ID. All authenticated roles can access.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiSuccessResponse(BookingResponseDto)
  @ApiNotFound('Booking')
  findOne(@Param('id') id: string) {
    const data = this.bookingsService.findOne(id);
    return { message: 'Booking retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER)
  @ApiOperation({
    summary: 'Update booking status or notes',
    description:
      'Agents and admins can update booking status (pending → confirmed → completed) ' +
      'and notes. Cannot change status of completed bookings.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiSuccessResponse(BookingResponseDto)
  @ApiNotFound('Booking')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const data = this.bookingsService.update(id, dto);
    return { message: 'Booking updated successfully', data };
  }

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.BUYER, Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({
    summary: 'Cancel a booking',
    description:
      'Cancels a pending or confirmed booking. ' +
      'Cannot cancel completed bookings or already-cancelled bookings.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'book_000001' })
  @ApiNotFound('Booking')
  cancel(@Param('id') id: string) {
    const data = this.bookingsService.cancel(id);
    return { message: 'Booking cancelled successfully', data };
  }
}
