import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Collection, Connection } from 'mongoose';
import { PropertiesService } from '../properties/properties.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
import { BookingStatus } from '../../shared/enums/booking.enum.js';
import { istTimestamp } from '../../shared/helpers/ist-time.helper.js';

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
  private readonly bookings: Collection<BookingEntity & { _id: string }>;

  constructor(
    @InjectConnection() connection: Connection,
    private readonly propertiesService: PropertiesService,
  ) {
    this.bookings = connection.collection<BookingEntity & { _id: string }>('bookings');
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
      createdAt: istTimestamp(b.createdAt),
      updatedAt: istTimestamp(b.updatedAt),
    };
  }

  async create(dto: CreateBookingDto): Promise<BookingResponseDto> {
    // Validate property exists
    await this.propertiesService.findOne(dto.propertyId); // Throws 404 if not found

    // Validate booking date is in the future
    const bookingDate = new Date(`${dto.date}T${dto.time}:00`);
    if (bookingDate <= new Date()) {
      throw new BadRequestException(
        'Booking date and time must be in the future',
      );
    }

    // Check for duplicate booking (same buyer, property, date, time)
    const duplicate = await this.bookings.findOne({
      propertyId: dto.propertyId,
      buyerId: dto.buyerId,
      date: dto.date,
      time: dto.time,
      status: { $ne: BookingStatus.CANCELLED },
    });
    if (duplicate) {
      throw new BadRequestException(
        'You already have a booking for this property at the same date and time',
      );
    }

    const now = new Date();
    const booking: BookingEntity = {
      id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      propertyId: dto.propertyId,
      buyerId: dto.buyerId,
      date: dto.date,
      time: dto.time,
      status: BookingStatus.PENDING,
      notes: dto.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.bookings.insertOne({ ...booking, _id: booking.id });
    return this.toResponse(booking);
  }

  async findAll(): Promise<BookingResponseDto[]> {
    const bookings = await this.bookings.find({}).sort({ createdAt: -1 }).toArray();
    return bookings.map(this.toResponse.bind(this));
  }

  async findByBuyer(buyerId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookings.find({ buyerId }).sort({ createdAt: -1 }).toArray();
    return bookings.map(this.toResponse.bind(this));
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookings.findOne({ _id: id });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    return this.toResponse(booking);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<BookingResponseDto> {
    const booking = await this.bookings.findOne({ _id: id });
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

    const update = {
      ...(dto.status && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      updatedAt: new Date(),
    };
    const result = await this.bookings.findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: 'after' });
    if (!result) throw new NotFoundException(`Booking with ID "${id}" not found`);
    return this.toResponse(result);
  }

  async cancel(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookings.findOne({ _id: id });
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
