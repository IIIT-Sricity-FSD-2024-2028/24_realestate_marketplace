import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';
import { ListingsService } from '../services/listings.service.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';

@ApiTags('Listings')
@ApiExtraModels(PropertyResponseDto)
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search and filter property listings',
    description:
      'Public search endpoint. Supports filtering by city, state, type, listing type, ' +
      'status, price range, bedrooms, and area. Results are paginated (max 50 per page). ' +
      'If minPrice > maxPrice, a 400 error is returned.',
  })
  @ApiOkResponse({
    description: 'Paginated list of matching properties',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Search completed successfully' },
        data: {
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/PropertyResponseDto' },
            },
            total: { type: 'number', example: 42 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  search(@Query() filters: ListingFilterDto) {
    const data = this.listingsService.search(filters);
    return {
      message: `Search completed successfully. Found ${data.total} propert${data.total === 1 ? 'y' : 'ies'}.`,
      data,
    };
  }
}
