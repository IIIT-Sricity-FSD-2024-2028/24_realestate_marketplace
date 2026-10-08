import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateSellerDto {
  @ApiProperty({ example: 'Seller Sam' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sam@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'TAX-999', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

}
