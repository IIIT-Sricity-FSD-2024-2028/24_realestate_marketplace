import { PropertyType, PropertyStatus, ListingType } from '../../../shared/enums/property.enum.js';
import { ServiceCity } from '../../../shared/constants/service-cities.js';
export declare class CreatePropertyDto {
    title: string;
    description: string;
    type: PropertyType;
    listingType: ListingType;
    price: number;
    areaSqft: number;
    bedrooms: number;
    bathrooms: number;
    address: string;
    city: ServiceCity;
    status?: PropertyStatus;
    images?: string[];
}
