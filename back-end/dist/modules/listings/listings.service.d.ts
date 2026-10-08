import { PropertiesService, PaginatedResult } from '../properties/properties.service.js';
import { ListingFilterDto } from './dto/listing-filter.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';
export type PaginatedListings = PaginatedResult<PropertyResponseDto>;
export declare class ListingsService {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    search(filters: ListingFilterDto): Promise<PaginatedListings>;
}
