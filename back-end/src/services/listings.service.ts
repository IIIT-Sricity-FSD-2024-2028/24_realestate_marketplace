import { Injectable, BadRequestException } from '@nestjs/common';
import { PropertiesService } from './properties.service.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';

export interface PaginatedListings {
  items: PropertyResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListingsService {
  constructor(private readonly propertiesService: PropertiesService) {}

  search(filters: ListingFilterDto): PaginatedListings {
    // Validate price range consistency
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new BadRequestException(
        'minPrice cannot be greater than maxPrice',
      );
    }

    let results = this.propertiesService.findAll();

    // Apply filters
    if (filters.city) {
      results = results.filter(
        (p) => p.city.toLowerCase() === filters.city!.toLowerCase(),
      );
    }
    if (filters.state) {
      results = results.filter(
        (p) => p.state.toLowerCase() === filters.state!.toLowerCase(),
      );
    }
    if (filters.type) {
      results = results.filter((p) => p.type === filters.type);
    }
    if (filters.listingType) {
      results = results.filter((p) => p.listingType === filters.listingType);
    }
    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.minBedrooms !== undefined) {
      results = results.filter((p) => p.bedrooms >= filters.minBedrooms!);
    }
    if (filters.minAreaSqft !== undefined) {
      results = results.filter((p) => p.areaSqft >= filters.minAreaSqft!);
    }

    const total = results.length;
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 10, 50);
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = results.slice(start, start + limit);

    return { items, total, page, limit, totalPages };
  }
}
