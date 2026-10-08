import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VisitStatus } from '../../../shared/enums/visit.enum.js';

export class VisitResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  propertyId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  buyerId: string | null;

  @ApiProperty({ example: '2026-03-10' })
  requestedDate: string;

  @ApiProperty({ example: '10:00 AM' })
  requestedSlot: string;

  @ApiProperty({ example: 'Interested in the kitchen size.', nullable: true })
  message: string | null;

  @ApiProperty({ enum: VisitStatus, example: VisitStatus.PENDING })
  status: VisitStatus;

  @ApiProperty({ example: null, nullable: true })
  cancelReason: string | null;

  @ApiPropertyOptional({ description: 'Populated on list/detail endpoints' })
  propertyTitle?: string;

  @ApiPropertyOptional()
  propertyCity?: string;

  @ApiPropertyOptional()
  propertyState?: string;

  @ApiPropertyOptional()
  propertyImage?: string | null;

  @ApiPropertyOptional({ description: 'Populated only on the admin review-queue endpoint' })
  buyerName?: string;

  @ApiPropertyOptional()
  buyerEmail?: string;

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T05:30:00.000+05:30' })
  updatedAt: string;
}
