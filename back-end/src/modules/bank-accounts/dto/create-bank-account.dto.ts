import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'usr_001' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'Chase' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'CHAS0001', required: false })
  @IsString()
  @IsOptional()
  ifsc?: string;

}
