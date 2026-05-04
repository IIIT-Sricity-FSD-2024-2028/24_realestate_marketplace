import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateBuyerDto {
  @ApiProperty({ example: 'Buyer Bob' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'bob@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: ['NY', 'CA'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredLocations?: string[];

}
