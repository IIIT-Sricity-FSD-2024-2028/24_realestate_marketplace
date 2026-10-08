import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyVerificationStatus } from '../../../shared/enums/property.enum.js';

export class ReviewQueueFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by moderation state. Omit to see every listing regardless of state.',
    enum: PropertyVerificationStatus,
    example: PropertyVerificationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PropertyVerificationStatus)
  verificationStatus?: PropertyVerificationStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
