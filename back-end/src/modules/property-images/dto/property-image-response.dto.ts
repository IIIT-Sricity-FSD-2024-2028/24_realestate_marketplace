import { ApiProperty } from '@nestjs/swagger';

export class PropertyImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty({ example: 'https://example.com/img.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 'Living Room' })
  caption: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
