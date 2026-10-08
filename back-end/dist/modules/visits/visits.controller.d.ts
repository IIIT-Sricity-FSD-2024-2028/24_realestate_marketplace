import { VisitsService } from './visits.service.js';
import { CreateVisitDto, RescheduleVisitDto, CancelVisitDto } from './dto/create-visit.dto.js';
import { VisitResponseDto } from './dto/visit-response.dto.js';
import { VisitFilterDto } from './dto/visit-filter.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class VisitsController {
    private readonly visitsService;
    constructor(visitsService: VisitsService);
    create(dto: CreateVisitDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto[];
    }>;
    findForReview(filters: VisitFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../properties/properties.service.js").PaginatedResult<VisitResponseDto>;
    }>;
    findOne(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
    confirm(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
    reschedule(id: string, dto: RescheduleVisitDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
    complete(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
    cancel(id: string, dto: CancelVisitDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: VisitResponseDto;
    }>;
}
