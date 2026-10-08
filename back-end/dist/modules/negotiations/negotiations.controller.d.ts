import { NegotiationsService } from './negotiations.service.js';
import { CreateNegotiationDto, CounterNegotiationDto, RejectNegotiationDto } from './dto/create-negotiation.dto.js';
import { NegotiationResponseDto } from './dto/negotiation-response.dto.js';
import { NegotiationFilterDto } from './dto/negotiation-filter.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class NegotiationsController {
    private readonly negotiationsService;
    constructor(negotiationsService: NegotiationsService);
    create(dto: CreateNegotiationDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto[];
    }>;
    findForReview(filters: NegotiationFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../properties/properties.service.js").PaginatedResult<NegotiationResponseDto>;
    }>;
    findForSeller(filters: NegotiationFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("../properties/properties.service.js").PaginatedResult<NegotiationResponseDto>;
    }>;
    findOne(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    counter(id: string, dto: CounterNegotiationDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    accept(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    reject(id: string, dto: RejectNegotiationDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    acceptCounter(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
    withdraw(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: NegotiationResponseDto;
    }>;
}
