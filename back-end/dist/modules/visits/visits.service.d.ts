import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { VisitDocument } from './schemas/visit.schema.js';
import { CreateVisitDto, RescheduleVisitDto, CancelVisitDto } from './dto/create-visit.dto.js';
import { VisitResponseDto } from './dto/visit-response.dto.js';
import { VisitFilterDto } from './dto/visit-filter.dto.js';
import { PropertiesService } from '../properties/properties.service.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import type { PaginatedResult } from '../properties/properties.service.js';
export declare class VisitsService implements OnModuleInit {
    private readonly visitModel;
    private readonly propertiesService;
    private readonly logger;
    constructor(visitModel: Model<VisitDocument>, propertiesService: PropertiesService);
    onModuleInit(): Promise<void>;
    private toResponse;
    private assertValidId;
    private loadOrThrow;
    private assertOwnsOrElevated;
    private assertCanManage;
    create(dto: CreateVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto>;
    findByOwner(buyerId: string): Promise<VisitResponseDto[]>;
    findForReview(actor: AuthenticatedUser, filters: VisitFilterDto): Promise<PaginatedResult<VisitResponseDto>>;
    confirm(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto>;
    reschedule(id: string, dto: RescheduleVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto>;
    complete(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto>;
    cancel(id: string, dto: CancelVisitDto, actor: AuthenticatedUser): Promise<VisitResponseDto>;
    findOne(id: string, actor: AuthenticatedUser): Promise<VisitResponseDto>;
}
