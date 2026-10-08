import { ListingsService } from './listings.service.js';
import { ListingFilterDto } from './dto/listing-filter.dto.js';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    search(filters: ListingFilterDto): Promise<{
        message: string;
        data: import("./listings.service.js").PaginatedListings;
    }>;
}
