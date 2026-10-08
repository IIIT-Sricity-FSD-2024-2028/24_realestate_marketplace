import { CommissionsService } from './commissions.service.js';
import { CommissionResponseDto } from './dto/commission-response.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class WaiveCommissionDto {
    reason?: string;
}
export declare class CommissionsController {
    private readonly service;
    constructor(service: CommissionsService);
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: CommissionResponseDto[];
    }>;
    findAll(limit?: string): Promise<{
        message: string;
        data: CommissionResponseDto[];
    }>;
    reinstate(id: string): Promise<{
        message: string;
        data: CommissionResponseDto;
    }>;
    waive(id: string, dto: WaiveCommissionDto): Promise<{
        message: string;
        data: CommissionResponseDto;
    }>;
}
