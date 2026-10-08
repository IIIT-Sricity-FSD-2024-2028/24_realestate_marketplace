import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsArray,
  ArrayMinSize,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PropertyType, PropertyStatus, ListingType } from '../../../shared/enums/property.enum.js';
import { ServiceCity, SERVICE_CITIES } from '../../../shared/constants/service-cities.js';

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: '3BHK Renovated Apartment in Anna Nagar' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description with new amenities.' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @ApiPropertyOptional({ enum: PropertyType, example: PropertyType.VILLA })
  @IsOptional()
  @IsEnum(PropertyType, {
    message: `Type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  type?: PropertyType;

  @ApiPropertyOptional({ enum: ListingType, example: ListingType.RENT })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiPropertyOptional({ example: 8500000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 1350 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  areaSqft?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  bathrooms?: number;

  @ApiPropertyOptional({ example: '50, 6th Avenue, Anna Nagar, Chennai' })
  @IsOptional()
  @IsString()
  address?: string;

  // Moving a listing to another city hands it to that city's admin — see
  // PropertiesService.update, which re-derives `state` and `adminId` from it.
  @ApiPropertyOptional({ enum: ServiceCity, example: ServiceCity.CHENNAI })
  @IsOptional()
  @IsEnum(ServiceCity, {
    message: `City must be one of the cities we operate in: ${SERVICE_CITIES.join(', ')}`,
  })
  city?: ServiceCity;

  // `state` follows from `city` (CITY_STATE) and is never set directly.

  @ApiPropertyOptional({ enum: PropertyStatus, example: PropertyStatus.SOLD })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: `Status must be one of: ${Object.values(PropertyStatus).join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://cdn.example.com/new-img.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'ID of the admin managing this property',
    example: 'usr_000003',
  })
  @IsOptional()
  @IsString()
  adminId?: string;
}
