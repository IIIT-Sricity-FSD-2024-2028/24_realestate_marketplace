import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateNegotiationDto {
  @ApiProperty({ example: 'prop_001' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'usr_002' })
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @IsPositive()
  offeredPrice: number;

  @ApiProperty({ example: 'PENDING', required: false })
  @IsString()
  @IsOptional()
  status?: string;

}
