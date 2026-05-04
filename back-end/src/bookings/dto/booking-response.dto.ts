import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../common/enums/booking.enum.js';

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
    example: 'Please ensure the property agent is present.',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-10T00:00:00.000Z' })
  updatedAt: string;
}
