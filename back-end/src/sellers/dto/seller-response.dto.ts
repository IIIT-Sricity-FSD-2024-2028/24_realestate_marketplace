import { ApiProperty } from '@nestjs/swagger';

export class SellerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Seller Sam' })
  name: string;

  @ApiProperty({ example: 'sam@example.com' })
  email: string;

  @ApiProperty({ example: 'TAX-999' })
  taxId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
