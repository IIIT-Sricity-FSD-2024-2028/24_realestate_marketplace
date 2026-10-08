import { ListingType } from '../../../shared/enums/property.enum.js';
import { DealStatus } from '../../../shared/enums/purchase.enum.js';
import { CommissionResponseDto } from '../../commissions/dto/commission-response.dto.js';
export declare class PurchaseResponseDto {
    id: string;
    propertyId: string | null;
    buyerId: string | null;
    negotiationId: string | null;
    agreedPrice: number;
    dealStep: number;
    dealStepLabel: string;
    dealStatus: DealStatus;
    propertyTitle?: string;
    propertyCity?: string;
    propertyState?: string;
    propertyImage?: string | null;
    propertyListingType?: ListingType;
    buyerName?: string;
    buyerEmail?: string;
    commissionDue?: number;
    commissionPaid?: number;
    awaitingCommission?: boolean;
    commissions?: CommissionResponseDto[];
    createdAt: string;
    updatedAt: string;
}
