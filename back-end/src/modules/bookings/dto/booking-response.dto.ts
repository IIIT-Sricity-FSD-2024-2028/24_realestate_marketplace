import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../../shared/enums/booking.enum.js';

export class BookingResponseDto {
  @ApiProperty({ example: 'book_000001' })
  id: string;

  @ApiProperty({ example: 'prop_000001' })
  propertyId: string;

  @ApiProperty({ example: 'usr_000003' })
  buyerId: string;

  @ApiProperty({ example: '2025-03-15' })
  date: string;

  @ApiProperty({ example: '14:30' })
  time: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status: BookingStatus;

  @ApiProperty({
    example: 'Please ensure the property manager is present.',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-10T05:30:00.000+05:30' })
  updatedAt: string;
}
