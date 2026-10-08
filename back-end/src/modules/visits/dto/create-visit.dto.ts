import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ description: 'Property to visit', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'propertyId must be a valid property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Requested visit date', example: '2026-03-10' })
  @IsString()
  @IsNotEmpty()
  requestedDate: string;

  @ApiProperty({ description: 'Requested time slot', example: '10:00 AM' })
  @IsString()
  @IsNotEmpty()
  requestedSlot: string;

  @ApiPropertyOptional({ example: "I'm particularly interested in the kitchen size.", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class RescheduleVisitDto {
  @ApiProperty({ description: 'New proposed visit date', example: '2026-03-12' })
  @IsString()
  @IsNotEmpty()
  requestedDate: string;

  @ApiProperty({ description: 'New proposed time slot', example: '2:00 PM' })
  @IsString()
  @IsNotEmpty()
  requestedSlot: string;
}

export class CancelVisitDto {
  @ApiPropertyOptional({ example: 'Buyer no longer interested.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
