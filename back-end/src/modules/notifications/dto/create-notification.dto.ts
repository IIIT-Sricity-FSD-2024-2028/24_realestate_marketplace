import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'usr_001' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Your offer was accepted!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  read?: boolean;

}
