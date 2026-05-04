import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'CREDIT_CARD' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ example: 'usr_001' })
  @IsString()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty({ example: 'tx_001', required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

}
