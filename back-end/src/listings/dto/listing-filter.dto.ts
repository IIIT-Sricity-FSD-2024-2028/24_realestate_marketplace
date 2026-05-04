import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyStatus, ListingType } from '../../common/enums/property.enum.js';

export class ListingFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Chennai',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by state',
    example: 'Tamil Nadu',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Filter by property type',
    enum: PropertyType,
    example: PropertyType.APARTMENT,
  })
  @IsOptional()
  @IsEnum(PropertyType, {
    message: `Type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  type?: PropertyType;

  @ApiPropertyOptional({
    description: 'Filter by listing type',
    enum: ListingType,
    example: ListingType.SALE,
  })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({
    description: 'Minimum price (₹)',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price (₹)',
    example: 10000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Minimum bedrooms',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minBedrooms?: number;

  @ApiPropertyOptional({
    description: 'Minimum area (sqft)',
    example: 800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minAreaSqft?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page (max 50)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
