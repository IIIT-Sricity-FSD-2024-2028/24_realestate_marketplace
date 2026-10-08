import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectPropertyDto {
  @ApiPropertyOptional({
    description: 'Optional reason shown to the seller explaining the rejection',
    example: 'The uploaded ownership document is illegible — please re-upload a clearer scan.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
