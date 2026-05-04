import { ApiProperty } from '@nestjs/swagger';

export class VisitResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty({ example: 'usr_001' })
  visitorId: string;

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  scheduledDate: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
