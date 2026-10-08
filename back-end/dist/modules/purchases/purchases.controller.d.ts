import { PurchasesService } from './purchases.service.js';
import { PurchaseResponseDto } from './dto/purchase-response.dto.js';
import { PurchaseFilterDto } from './dto/purchase-filter.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: PurchaseResponseDto[];
    }>;
    findForReview(filters: PurchaseFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../properties/properties.service.js").PaginatedResult<PurchaseResponseDto>;
    }>;
    findForSeller(filters: PurchaseFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../properties/properties.service.js").PaginatedResult<PurchaseResponseDto>;
    }>;
    findOne(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: PurchaseResponseDto;
    }>;
    advance(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: PurchaseResponseDto;
    }>;
    cancel(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: PurchaseResponseDto;
    }>;
}
