import { ApiProperty } from '@nestjs/swagger';

export class NegotiationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty({ example: 'usr_002' })
  buyerId: string;

  @ApiProperty({ example: 500000 })
  offeredPrice: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
