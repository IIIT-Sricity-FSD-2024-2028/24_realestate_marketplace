import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto): Promise<{
        message: string;
        data: BookingResponseDto;
    }>;
    findAll(buyerId?: string): Promise<{
        message: string;
        data: BookingResponseDto[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: BookingResponseDto;
    }>;
    update(id: string, dto: UpdateBookingDto): Promise<{
        message: string;
        data: BookingResponseDto;
    }>;
    cancel(id: string): Promise<{
        message: string;
        data: BookingResponseDto;
    }>;
}
