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
  ApiConflictResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('Users')
@ApiExtraModels(UserResponseDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── POST /users ───────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a user',
    description:
      'Creates a user record through admin-managed user management. An admin can create ' +
      '`user` accounts only — creating an `admin` or `superuser` account requires a superuser, ' +
      'otherwise an admin could mint a superuser and take over the platform. ' +
      'The password must meet complexity requirements. Email must be unique. ' +
      'For public self-registration, use POST /auth/register instead.',
  })
  @ApiSuccessResponse(UserResponseDto, 201)
  @ApiValidationError()
  @ApiConflictResponse({ description: 'A user with this email already exists' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.create(createUserDto, user);
    return { message: 'User created successfully', data };
  }

  // ─── GET /users ────────────────────────────────────────────────────────────
  @Get()
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'List all users',
    description: 'Returns all managed users. Admin-only endpoint.',
  })
  @ApiSuccessResponse(UserResponseDto, 200, true)
  async findAll() {
    const data = await this.usersService.findAll();
    return { message: 'Users retrieved successfully', data };
  }

  // ─── GET /users/:id ────────────────────────────────────────────────────────
  @Get(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a single user by their unique ID. Admin-only endpoint.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFound('User')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { message: 'User retrieved successfully', data };
  }

  // ─── PATCH /users/:id ─────────────────────────────────────────────────────
  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Partially updates user fields. Only send fields you want to change. Admin-only.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFound('User')
  @ApiValidationError()
  @ApiConflictResponse({ description: 'Email already taken by another user' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    const data = await this.usersService.update(id, updateUserDto, actor);
    return { message: 'User updated successfully', data };
  }

  // ─── DELETE /users/:id ────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Permanently deletes a user account. Admin-only.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiNotFound('User')
  async remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    await this.usersService.remove(id, actor);
    return { message: 'User deleted successfully', data: null };
  }
}
