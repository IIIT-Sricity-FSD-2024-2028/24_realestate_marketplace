import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PropertiesService } from './properties.service.js';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto.js';
import { UpdateBookingDto } from '../bookings/dto/update-booking.dto.js';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto.js';
import { BookingStatus } from '../common/enums/booking.enum.js';

interface BookingEntity {
  id: string;
  propertyId: string;
  buyerId: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BookingsService {
  private readonly bookings: Map<string, BookingEntity> = new Map();
  private counter = 0;

  constructor(private readonly propertiesService: PropertiesService) {}

  private generateId(): string {
    return `book_${String(++this.counter).padStart(6, '0')}`;
  }

  private toResponse(b: BookingEntity): BookingResponseDto {
    return {
      id: b.id,
      propertyId: b.propertyId,
      buyerId: b.buyerId,
      date: b.date,
      time: b.time,
      status: b.status,
      notes: b.notes,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }

  create(dto: CreateBookingDto): BookingResponseDto {
    // Validate property exists
    this.propertiesService.findOne(dto.propertyId); // Throws 404 if not found

    // Validate booking date is in the future
    const bookingDate = new Date(`${dto.date}T${dto.time}:00`);
    if (bookingDate <= new Date()) {
      throw new BadRequestException(
        'Booking date and time must be in the future',
      );
    }

    // Check for duplicate booking (same buyer, property, date, time)
    const duplicate = [...this.bookings.values()].find(
      (b) =>
        b.propertyId === dto.propertyId &&
        b.buyerId === dto.buyerId &&
        b.date === dto.date &&
        b.time === dto.time &&
        b.status !== BookingStatus.CANCELLED,
    );
    if (duplicate) {
      throw new BadRequestException(
        'You already have a booking for this property at the same date and time',
      );
    }

    const now = new Date();
    const booking: BookingEntity = {
      id: this.generateId(),
      propertyId: dto.propertyId,
      buyerId: dto.buyerId,
      date: dto.date,
      time: dto.time,
      status: BookingStatus.PENDING,
      notes: dto.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(booking.id, booking);
    return this.toResponse(booking);
  }

  findAll(): BookingResponseDto[] {
    return [...this.bookings.values()].map(this.toResponse.bind(this));
  }

  findByBuyer(buyerId: string): BookingResponseDto[] {
    return [...this.bookings.values()]
      .filter((b) => b.buyerId === buyerId)
      .map(this.toResponse.bind(this));
  }

  findOne(id: string): BookingResponseDto {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    return this.toResponse(booking);
  }

  update(id: string, dto: UpdateBookingDto): BookingResponseDto {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    // Prevent re-opening a completed or cancelled booking
    if (
      booking.status === BookingStatus.COMPLETED &&
      dto.status &&
      dto.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot change status of a completed booking');
    }

    const updated: BookingEntity = {
      ...booking,
      ...(dto.status && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      updatedAt: new Date(),
    };

    this.bookings.set(id, updated);
    return this.toResponse(updated);
  }

  cancel(id: string): BookingResponseDto {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    return this.update(id, { status: BookingStatus.CANCELLED });
  }
}
