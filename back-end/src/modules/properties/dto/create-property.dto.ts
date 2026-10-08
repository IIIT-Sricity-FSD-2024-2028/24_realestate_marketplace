import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
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

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property title / headline',
    example: '3BHK Spacious Apartment in Anna Nagar',
    minLength: 10,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(150, { message: 'Title must not exceed 150 characters' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the property',
    example: 'Beautifully furnished 3BHK with sea view, modular kitchen, and 24/7 security.',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  description: string;

  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.APARTMENT,
  })
  @IsEnum(PropertyType, {
    message: `Type must be one of: ${Object.values(PropertyType).join(', ')}`,
  })
  type: PropertyType;

  @ApiProperty({
    description: 'Listing type — for sale or rent',
    enum: ListingType,
    example: ListingType.SALE,
  })
  @IsEnum(ListingType, {
    message: `Listing type must be one of: ${Object.values(ListingType).join(', ')}`,
  })
  listingType: ListingType;

  @ApiProperty({
    description: 'Price in INR (₹). Must be a positive number.',
    example: 7500000,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    description: 'Area in square feet',
    example: 1200,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Area must be a number' })
  @IsPositive({ message: 'Area must be positive' })
  areaSqft: number;

  @ApiProperty({
    description: 'Number of bedrooms (0 for studios)',
    example: 3,
    minimum: 0,
    maximum: 20,
  })
  @IsInt({ message: 'Bedrooms must be a whole number' })
  @Min(0, { message: 'Bedrooms cannot be negative' })
  @Max(20, { message: 'Bedrooms cannot exceed 20' })
  bedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsInt({ message: 'Bathrooms must be a whole number' })
  @Min(1, { message: 'Must have at least 1 bathroom' })
  @Max(20, { message: 'Bathrooms cannot exceed 20' })
  bathrooms: number;

  @ApiProperty({
    description: 'Full street address',
    example: '42, 5th Avenue, Anna Nagar, Chennai',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description:
      'City the property is in. truEstate has launched in four cities only, ' +
      'and each is run by its own admin who verifies and manages every ' +
      'listing there — so a listing outside this list would have nobody to ' +
      'handle it and is rejected.',
    enum: ServiceCity,
    example: ServiceCity.HYDERABAD,
  })
  @IsEnum(ServiceCity, {
    message: `City must be one of the cities we operate in: ${SERVICE_CITIES.join(', ')}`,
  })
  city: ServiceCity;

  // `state` is intentionally not accepted from the caller: it is derived from
  // `city` (see CITY_STATE) so the pair can never disagree, and so the seller
  // form has one less free-text field to get wrong.

  @ApiProperty({
    description: 'Current availability status',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
    default: PropertyStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: `Status must be one of: ${Object.values(PropertyStatus).join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiProperty({
    description: 'List of image URLs for the property',
    type: [String],
    example: ['https://cdn.example.com/img1.jpg', 'https://cdn.example.com/img2.jpg'],
    minItems: 1,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Images must be an array of URLs' })
  @ArrayMinSize(1, { message: 'Provide at least one image URL' })
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  images?: string[];

  // `adminId` used to be settable here, back when an admin could create a
  // listing of their own. Only sellers can list a property now, and the
  // owner is always the authenticated seller — so there is nothing for a
  // caller to assign, and accepting the field would only invite confusion.
}
