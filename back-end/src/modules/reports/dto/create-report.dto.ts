import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'admin_01' })
  @IsString()
  @IsNotEmpty()
  generatedBy: string;

  @ApiProperty({ example: 'SALES_SUMMARY' })
  @IsString()
  @IsNotEmpty()
  reportType: string;

  @ApiProperty({ example: 'Q1 Sales Data...' })
  @IsString()
  @IsNotEmpty()
  content: string;

}
