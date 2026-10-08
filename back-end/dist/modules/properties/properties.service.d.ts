import { OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { PropertyResponseDto } from './dto/property-response.dto.js';
import { ReviewQueueFilterDto } from './dto/review-queue-filter.dto.js';
import { PropertyDocument } from './schemas/property.schema.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { FeaturedTier } from '../../shared/enums/billing.enum.js';
import { ListingType } from '../../shared/enums/property.enum.js';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface UploadedFileInfo {
    url: string;
    originalName: string;
}
export declare class PropertiesService implements OnModuleInit {
    private readonly propertyModel;
    private readonly usersService;
    private readonly subscriptionsService;
    private readonly logger;
    constructor(propertyModel: Model<PropertyDocument>, usersService: UsersService, subscriptionsService: SubscriptionsService);
    onModuleInit(): Promise<void>;
    private syncCityAdmins;
    private toResponse;
    private canSeeDocuments;
    private assertValidId;
    private loadOrThrow;
    private assertCanManage;
    create(dto: CreatePropertyDto, actor: AuthenticatedUser): Promise<PropertyResponseDto>;
    countListingsForQuota(sellerId: string): Promise<number>;
    private assertListingQuota;
    applyFeature(propertyId: string, tier: FeaturedTier, sellerId: string): Promise<PropertyResponseDto>;
    dealFacts(propertyId: string): Promise<{
        sellerId: string | null;
        city: string | null;
        listingType: ListingType;
    } | null>;
    promotableForSeller(sellerId: string): Promise<PropertyResponseDto[]>;
    findAll(): Promise<PropertyResponseDto[]>;
    findOne(id: string, actor?: AuthenticatedUser): Promise<PropertyResponseDto>;
    findByOwner(ownerId: string): Promise<PropertyResponseDto[]>;
    private resolveCityAdminId;
    private adminCity;
    propertyIdsForAdmin(actor: AuthenticatedUser): Promise<Types.ObjectId[] | null>;
    assertAdminHandlesProperty(propertyId: string | null, actor: AuthenticatedUser): Promise<void>;
    propertyIdsForSeller(sellerId: string): Promise<Types.ObjectId[]>;
    markDealClosed(propertyId: string): Promise<void>;
    markDealReopened(propertyId: string): Promise<void>;
    isDealClosed(propertyId: string): Promise<boolean>;
    getOwnershipInfo(propertyId: string): Promise<{
        adminId: string | null;
        sellerId: string | null;
    }>;
    findForReview(filters: ReviewQueueFilterDto, actor: AuthenticatedUser): Promise<PaginatedResult<PropertyResponseDto>>;
    update(id: string, dto: UpdatePropertyDto, actor: AuthenticatedUser): Promise<PropertyResponseDto>;
    remove(id: string, actor: AuthenticatedUser): Promise<void>;
    private assertCanVerify;
    private assertRunsCity;
    verify(id: string, actor: AuthenticatedUser): Promise<PropertyResponseDto>;
    reject(id: string, reason: string | undefined, actor: AuthenticatedUser): Promise<PropertyResponseDto>;
    addDocuments(id: string, actor: AuthenticatedUser, files: UploadedFileInfo[]): Promise<PropertyResponseDto>;
    addImages(id: string, actor: AuthenticatedUser, urls: string[]): Promise<PropertyResponseDto>;
    search(filters: ListingFilterDto, includeClosed?: boolean): Promise<PaginatedResult<PropertyResponseDto>>;
}
