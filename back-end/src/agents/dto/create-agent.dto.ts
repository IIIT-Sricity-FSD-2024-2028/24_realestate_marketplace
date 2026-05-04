import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ example: 'Agent Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'agent@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'LIC-12345' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ example: 'Prime Properties', required: false })
  @IsString()
  @IsOptional()
  agencyName?: string;

}
