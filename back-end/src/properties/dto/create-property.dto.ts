import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
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
    description: 'City name',
    example: 'Chennai',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({
    description: 'State name',
    example: 'Tamil Nadu',
  })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

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
    description: 'List of property images as external URLs or uploaded image data strings',
    type: [String],
    example: ['https://cdn.example.com/img1.jpg', 'data:image/jpeg;base64,...'],
    minItems: 1,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Images must be an array of image strings' })
  @ArrayMinSize(1, { message: 'Provide at least one image URL' })
  @IsString({ each: true, message: 'Each image must be a valid string' })
  images?: string[];

  @ApiProperty({
    description: 'ID of the agent managing this property',
    example: 'usr_000002',
    required: false,
  })
  @IsOptional()
  @IsString()
  agentId?: string;
}
