import { ApiProperty } from '@nestjs/swagger';

export class ShortlistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'usr_001' })
  userId: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
