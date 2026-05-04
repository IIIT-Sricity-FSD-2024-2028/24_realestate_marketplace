import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BookingStatus } from '../../common/enums/booking.enum.js';

export class UpdateBookingDto {
  @ApiPropertyOptional({
    description: 'Updated booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(BookingStatus, {
    message: `Status must be one of: ${Object.values(BookingStatus).join(', ')}`,
  })
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Updated notes or remarks',
    example: 'Buyer will bring their architect for inspection.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  notes?: string;
}
