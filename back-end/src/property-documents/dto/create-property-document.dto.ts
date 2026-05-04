import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreatePropertyDocumentDto {
  @ApiProperty({ example: 'prop_001' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'DEED' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ example: 'https://example.com/doc.pdf' })
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

}
