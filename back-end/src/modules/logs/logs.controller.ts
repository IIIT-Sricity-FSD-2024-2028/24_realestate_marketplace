import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { LOG_CHANNELS, LogChannel } from '../../common/logging/log-channels.js';
import { LogChannelParamDto, LogQueryDto } from './dto/log-query.dto.js';
import { LogsService } from './logs.service.js';

/**
 * Read-only window onto the log files, for admins and the superuser.
 *
 * The files themselves are the record; this just saves someone having to SSH into
 * the box to read them. Deliberately read-only — there is no endpoint that can
 * edit or delete a log entry.
 */
@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'List every log channel and the files it has on disk',
    description:
      'Returns the four channels (http, error, app, audit) with their directory, the file ' +
      'currently being appended to, and every rotated file with its size.',
  })
  summary() {
    return { message: 'Log files retrieved successfully', data: this.logsService.summary() };
  }

  @Get(':channel')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Read the most recent entries from one log channel',
    description:
      'Tails the current file (or the one named by ?file=), newest entry last. ' +
      'Use ?lines= to change how many, and ?level= to filter by severity.',
  })
  @ApiParam({ name: 'channel', enum: LOG_CHANNELS })
  async read(@Param() params: LogChannelParamDto, @Query() query: LogQueryDto) {
    const data = await this.logsService.read(params.channel as LogChannel, query);
    return { message: 'Log entries retrieved successfully', data };
  }
}
