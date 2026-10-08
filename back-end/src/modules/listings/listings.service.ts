import { Injectable } from '@nestjs/common';
import { PropertiesService, PaginatedResult } from '../properties/properties.service.js';
import { ListingFilterDto } from './dto/listing-filter.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';

export type PaginatedListings = PaginatedResult<PropertyResponseDto>;

@Injectable()
export class ListingsService {
  constructor(private readonly propertiesService: PropertiesService) {}

  /** Thin wrapper over PropertiesService's DB-level filter/paginate query. */
  search(filters: ListingFilterDto): Promise<PaginatedListings> {
    return this.propertiesService.search(filters);
  }
}
