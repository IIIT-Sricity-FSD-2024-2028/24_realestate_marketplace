import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the property to book a viewing for',
    example: 'prop_000001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @ApiProperty({
    description: 'ID of the buyer making the booking',
    example: 'usr_000003',
  })
  @IsString()
  @IsNotEmpty({ message: 'Buyer ID is required' })
  buyerId: string;

  @ApiProperty({
    description: 'Viewing appointment date (ISO 8601 format: YYYY-MM-DD)',
    example: '2025-03-15',
  })
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Booking date is required' })
  date: string;

  @ApiProperty({
    description: 'Preferred viewing time (HH:MM in 24-hour format)',
    example: '14:30',
  })
  @IsString()
  @IsNotEmpty({ message: 'Time is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM 24-hour format (e.g., 14:30)',
  })
  time: string;

  @ApiProperty({
    description: 'Optional notes or special requests for the viewing',
    example: 'Please ensure the property agent is present.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Notes must be at least 5 characters if provided' })
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}
