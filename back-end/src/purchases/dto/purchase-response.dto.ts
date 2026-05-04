import { ApiProperty } from '@nestjs/swagger';

export class PurchaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty({ example: 'usr_001' })
  buyerId: string;

  @ApiProperty({ example: 450000 })
  finalPrice: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
