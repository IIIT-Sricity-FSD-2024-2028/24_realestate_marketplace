import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateNegotiationDto {
  @ApiProperty({ description: 'Property being negotiated on', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @IsMongoId({ message: 'propertyId must be a valid property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Your offer amount (₹)', example: 8200000 })
  @IsNumber({}, { message: 'offerAmount must be a number' })
  @IsPositive({ message: 'offerAmount must be positive' })
  offerAmount: number;

  @ApiPropertyOptional({ example: 'I can close quickly, all documents ready.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({ example: 'Home Loan', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMode?: string;
}

export class CounterNegotiationDto {
  @ApiProperty({ description: "Admin's counter-offer (₹)", example: 8800000 })
  @IsNumber({}, { message: 'counterAmount must be a number' })
  @IsPositive({ message: 'counterAmount must be positive' })
  counterAmount: number;
}

export class RejectNegotiationDto {
  @ApiPropertyOptional({ example: 'Offer too far below asking price.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
