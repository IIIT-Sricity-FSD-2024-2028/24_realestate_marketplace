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
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UpdateUserDto } from '../users/dto/update-user.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Users')
@ApiExtraModels(UserResponseDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── POST /users ───────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT, Role.SELLER, Role.BUYER)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account. Only admins can register users directly. ' +
      'The password must meet complexity requirements. Email must be unique.',
  })
  @ApiSuccessResponse(UserResponseDto, 201)
  @ApiValidationError()
  @ApiConflictResponse({ description: 'A user with this email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    const data = this.usersService.create(createUserDto);
    return { message: 'User created successfully', data };
  }

  // ─── GET /users ────────────────────────────────────────────────────────────
  @Get()
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({
    summary: 'List all users',
    description: 'Returns all registered users. Admin-only endpoint.',
  })
  @ApiSuccessResponse(UserResponseDto, 200, true)
  findAll() {
    const data = this.usersService.findAll();
    return { message: 'Users retrieved successfully', data };
  }

  // ─── GET /users/:id ────────────────────────────────────────────────────────
  @Get(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER, Role.AGENT)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a single user by their unique ID. Accessible by admins and agents.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'usr_000001' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFound('User')
  findOne(@Param('id') id: string) {
    const data = this.usersService.findOne(id);
    return { message: 'User retrieved successfully', data };
  }

  // ─── PATCH /users/:id ─────────────────────────────────────────────────────
  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Partially updates user fields. Only send fields you want to change. Admin-only.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'usr_000001' })
  @ApiSuccessResponse(UserResponseDto)
  @ApiNotFound('User')
  @ApiValidationError()
  @ApiConflictResponse({ description: 'Email already taken by another user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = this.usersService.update(id, updateUserDto);
    return { message: 'User updated successfully', data };
  }

  // ─── DELETE /users/:id ────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Permanently deletes a user account. Admin-only.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'usr_000001' })
  @ApiNotFound('User')
  remove(@Param('id') id: string) {
    this.usersService.remove(id);
    return { message: 'User deleted successfully', data: null };
  }
}
