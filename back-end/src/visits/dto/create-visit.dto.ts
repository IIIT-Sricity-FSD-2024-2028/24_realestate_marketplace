import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ example: 'prop_001' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'usr_001' })
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  @IsString()
  @IsNotEmpty()
  scheduledDate: string;

}
