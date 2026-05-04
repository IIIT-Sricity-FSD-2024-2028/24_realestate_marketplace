import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'prop_001' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'usr_001' })
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({ example: 450000 })
  @IsNumber()
  @IsPositive()
  finalPrice: number;

}
