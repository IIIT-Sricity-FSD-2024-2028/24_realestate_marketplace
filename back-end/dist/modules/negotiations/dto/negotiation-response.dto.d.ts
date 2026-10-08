import { NegotiationStatus } from '../../../shared/enums/negotiation.enum.js';
export declare class NegotiationResponseDto {
    id: string;
    propertyId: string | null;
    buyerId: string | null;
    offerAmount: number;
    counterAmount: number | null;
    message: string | null;
    paymentMode: string | null;
    status: NegotiationStatus;
    rejectionReason: string | null;
    canRespond?: boolean;
    propertyHasSeller?: boolean;
    propertyTitle?: string;
    propertyCity?: string;
    propertyState?: string;
    propertyImage?: string | null;
    buyerName?: string;
    buyerEmail?: string;
    createdAt: string;
    updatedAt: string;
}
