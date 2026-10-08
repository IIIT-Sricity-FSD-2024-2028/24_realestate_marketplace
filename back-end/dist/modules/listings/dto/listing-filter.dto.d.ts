import { PropertyType, PropertyStatus, ListingType } from '../../../shared/enums/property.enum.js';
export declare class ListingFilterDto {
    city?: string;
    state?: string;
    type?: PropertyType;
    listingType?: ListingType;
    status?: PropertyStatus;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minAreaSqft?: number;
    page?: number;
    limit?: number;
}
