import { Model } from 'mongoose';
import { CommissionDocument } from './schemas/commission.schema.js';
import { CommissionResponseDto } from './dto/commission-response.dto.js';
import { ListingType } from '../../shared/enums/property.enum.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
export interface DealFacts {
    purchaseId: string;
    propertyId: string;
    buyerId: string;
    sellerId: string | null;
    city: string | null;
    listingType: ListingType;
    agreedPrice: number;
}
export declare class CommissionsService {
    private readonly commissionModel;
    private readonly subscriptionsService;
    private readonly logger;
    constructor(commissionModel: Model<CommissionDocument>, subscriptionsService: SubscriptionsService);
    toResponse(c: CommissionDocument): CommissionResponseDto;
    accrueForPurchase(facts: DealFacts): Promise<CommissionDocument[]>;
    loadOrThrow(id: string): Promise<CommissionDocument>;
    loadPayable(id: string, partyId: string): Promise<CommissionDocument>;
    settle(commissionId: string, paymentId: string): Promise<CommissionDocument>;
    waive(commissionId: string, reason: string): Promise<CommissionResponseDto>;
    reinstate(commissionId: string): Promise<CommissionResponseDto>;
    outstandingForPurchase(purchaseId: string): Promise<CommissionDocument[]>;
    summaryForPurchases(purchaseIds: string[]): Promise<Map<string, {
        due: number;
        paid: number;
        lines: CommissionResponseDto[];
    }>>;
    findByParty(partyId: string): Promise<CommissionResponseDto[]>;
    findAll(limit?: number): Promise<CommissionResponseDto[]>;
    totals(): Promise<Record<string, {
        amount: number;
        count: number;
    }>>;
    totalsByCity(): Promise<{
        city: string;
        amount: number;
        deals: number;
    }[]>;
}
