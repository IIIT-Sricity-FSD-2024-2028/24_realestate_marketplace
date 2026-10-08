import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { PropertyResponseDto } from './dto/property-response.dto.js';
import { RejectPropertyDto } from './dto/reject-property.dto.js';
import { ReviewQueueFilterDto } from './dto/review-queue-filter.dto.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(dto: CreatePropertyDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    findAll(filters: ListingFilterDto): Promise<{
        message: string;
        data: import("./properties.service.js").PaginatedResult<PropertyResponseDto>;
    }>;
    findMine(user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto[];
    }>;
    findForReview(filters: ReviewQueueFilterDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./properties.service.js").PaginatedResult<PropertyResponseDto>;
    }>;
    findOne(id: string, user: AuthenticatedUser | undefined): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    update(id: string, dto: UpdatePropertyDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    verify(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    reject(id: string, dto: RejectPropertyDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    uploadDocuments(id: string, files: Express.Multer.File[], user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    uploadImages(id: string, files: Express.Multer.File[], user: AuthenticatedUser): Promise<{
        message: string;
        data: PropertyResponseDto;
    }>;
    remove(id: string, user: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
}
