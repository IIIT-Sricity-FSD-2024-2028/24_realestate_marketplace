import { BookingStatus } from '../../../shared/enums/booking.enum.js';
export declare class BookingResponseDto {
    id: string;
    propertyId: string;
    buyerId: string;
    date: string;
    time: string;
    status: BookingStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}
