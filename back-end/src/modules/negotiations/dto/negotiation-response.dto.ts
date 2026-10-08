import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NegotiationStatus } from '../../../shared/enums/negotiation.enum.js';

export class NegotiationResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  propertyId: string | null;

  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1', nullable: true })
  buyerId: string | null;

  @ApiProperty({ example: 8200000 })
  offerAmount: number;

  @ApiProperty({ example: 8800000, nullable: true })
  counterAmount: number | null;

  @ApiProperty({ example: 'I can close quickly.', nullable: true })
  message: string | null;

  @ApiProperty({ example: 'Home Loan', nullable: true })
  paymentMode: string | null;

  @ApiProperty({ enum: NegotiationStatus, example: NegotiationStatus.PENDING })
  status: NegotiationStatus;

  @ApiProperty({ example: null, nullable: true })
  rejectionReason: string | null;

  @ApiPropertyOptional({
    description:
      'Only on the admin review-queue: whether the caller may counter/accept/reject this negotiation. ' +
      'Only ever true for the seller who listed the property — price is the seller\'s call, so the ' +
      'admin queue is always view-only.',
  })
  canRespond?: boolean;

  @ApiPropertyOptional({
    description:
      'Only on the admin review-queue: false when the property has no seller, meaning nobody can ' +
      'answer this offer until one is assigned.',
  })
  propertyHasSeller?: boolean;

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
