import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { LOG_CHANNELS } from '../../../common/logging/log-channels.js';
import type { LogChannel } from '../../../common/logging/log-channels.js';

export class LogQueryDto {
  @ApiPropertyOptional({
    description: 'Which log file to read. Defaults to the current (today\'s) file.',
    example: 'http-2026-08-28.log',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9._-]+\.log$/, { message: 'file must be a .log file name' })
  file?: string;

  @ApiPropertyOptional({
    description: 'How many of the most recent entries to return',
    default: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  lines?: number = 100;

  @ApiPropertyOptional({
    description: 'Only return entries at this level',
    enum: ['debug', 'info', 'warn', 'error', 'fatal'],
  })
  @IsOptional()
  @IsIn(['debug', 'info', 'warn', 'error', 'fatal'])
  level?: string;
}

export class LogChannelParamDto {
  @ApiPropertyOptional({ enum: LOG_CHANNELS })
  @IsIn(LOG_CHANNELS as unknown as string[])
  channel!: LogChannel;
}
