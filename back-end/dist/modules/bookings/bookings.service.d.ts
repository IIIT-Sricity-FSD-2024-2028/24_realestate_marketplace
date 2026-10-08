import { Connection } from 'mongoose';
import { PropertiesService } from '../properties/properties.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
export declare class BookingsService {
    private readonly propertiesService;
    private readonly bookings;
    constructor(connection: Connection, propertiesService: PropertiesService);
    private toResponse;
    create(dto: CreateBookingDto): Promise<BookingResponseDto>;
    findAll(): Promise<BookingResponseDto[]>;
    findByBuyer(buyerId: string): Promise<BookingResponseDto[]>;
    findOne(id: string): Promise<BookingResponseDto>;
    update(id: string, dto: UpdateBookingDto): Promise<BookingResponseDto>;
    cancel(id: string): Promise<BookingResponseDto>;
}
