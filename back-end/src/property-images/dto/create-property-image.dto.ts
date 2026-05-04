import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreatePropertyImageDto {
  @ApiProperty({ example: 'prop_001' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'https://example.com/img.jpg' })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ example: 'Living Room', required: false })
  @IsString()
  @IsOptional()
  caption?: string;

}
