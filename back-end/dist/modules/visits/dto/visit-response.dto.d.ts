import { VisitStatus } from '../../../shared/enums/visit.enum.js';
export declare class VisitResponseDto {
    id: string;
    propertyId: string | null;
    buyerId: string | null;
    requestedDate: string;
    requestedSlot: string;
    message: string | null;
    status: VisitStatus;
    cancelReason: string | null;
    propertyTitle?: string;
    propertyCity?: string;
    propertyState?: string;
    propertyImage?: string | null;
    buyerName?: string;
    buyerEmail?: string;
    createdAt: string;
    updatedAt: string;
}
