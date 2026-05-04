import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service.js';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto.js';
import { UpdateNotificationDto } from '../notifications/dto/update-notification.dto.js';
import { NotificationResponseDto } from '../notifications/dto/notification-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Notifications')
@ApiExtraModels(NotificationResponseDto)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiSuccessResponse(NotificationResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateNotificationDto) {
    const data = this.service.create(dto);
    return { message: 'Notification created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all notifications' })
  @ApiSuccessResponse(NotificationResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Notifications retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiSuccessResponse(NotificationResponseDto)
  @ApiNotFound('Notification')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Notification retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiSuccessResponse(NotificationResponseDto)
  @ApiNotFound('Notification')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    const data = this.service.update(id, dto);
    return { message: 'Notification updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiNotFound('Notification')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Notification deleted successfully', data: null };
  }
}
