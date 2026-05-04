import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, PropertyStatus, ListingType } from '../../common/enums/property.enum.js';

export class PropertyResponseDto {
  @ApiProperty({ example: 'prop_000001' })
  id: string;

  @ApiProperty({ example: '3BHK Spacious Apartment in Anna Nagar' })
  title: string;

  @ApiProperty({ example: 'Beautifully furnished 3BHK with sea view.' })
  description: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  type: PropertyType;

  @ApiProperty({ enum: ListingType, example: ListingType.SALE })
  listingType: ListingType;

  @ApiProperty({ example: 7500000 })
  price: number;

  @ApiProperty({ example: 1200 })
  areaSqft: number;

  @ApiProperty({ example: 3 })
  bedrooms: number;

  @ApiProperty({ example: 2 })
  bathrooms: number;

  @ApiProperty({ example: '42, 5th Avenue, Anna Nagar, Chennai' })
  address: string;

  @ApiProperty({ example: 'Chennai' })
  city: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  state: string;

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @ApiProperty({
    type: [String],
    example: ['https://cdn.example.com/img1.jpg'],
  })
  images: string[];

  @ApiProperty({ example: 'usr_000002', nullable: true })
  agentId: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  updatedAt: string;
}
