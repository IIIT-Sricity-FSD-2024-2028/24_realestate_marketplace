import { ApiProperty } from '@nestjs/swagger';

export class PropertyDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'prop_001' })
  propertyId: string;

  @ApiProperty({ example: 'DEED' })
  documentType: string;

  @ApiProperty({ example: 'https://example.com/doc.pdf' })
  fileUrl: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
