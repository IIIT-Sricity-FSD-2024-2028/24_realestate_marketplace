import { ApiProperty } from '@nestjs/swagger';

export class BuyerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Buyer Bob' })
  name: string;

  @ApiProperty({ example: 'bob@example.com' })
  email: string;

  @ApiProperty({ example: ['NY', 'CA'] })
  preferredLocations: string[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
