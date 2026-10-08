import { CommissionSide, CommissionStatus } from '../../../shared/enums/billing.enum.js';
export declare class CommissionResponseDto {
    id: string;
    purchaseId: string | null;
    propertyId: string | null;
    partyId: string | null;
    side: CommissionSide;
    dealValue: number;
    rateBps: number;
    ratePercent: number;
    baseAmount: number;
    taxAmount: number;
    amount: number;
    status: CommissionStatus;
    city: string | null;
    settledAt: string | null;
    waiverReason: string | null;
    propertyTitle?: string;
    partyName?: string;
    partyEmail?: string;
    createdAt: string;
}
