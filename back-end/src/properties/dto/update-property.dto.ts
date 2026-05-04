import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsArray,
  ArrayMinSize,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PropertyType, PropertyStatus, ListingType } from '../../common/enums/property.enum.js';

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

  @ApiPropertyOptional({ example: 'Coimbatore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ enum: PropertyStatus, example: PropertyStatus.SOLD })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: `Status must be one of: ${Object.values(PropertyStatus).join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://cdn.example.com/new-img.jpg', 'data:image/jpeg;base64,...'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true, message: 'Each image must be a valid string' })
  images?: string[];

  @ApiPropertyOptional({ example: 'usr_000003' })
  @IsOptional()
  @IsString()
  agentId?: string;
}
