import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { UsersService } from '../users/users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
import { ApiSuccessResponse, ApiValidationError } from '../../common/decorators/api-response.decorator.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Register a new account',
    description:
      'Public self-registration. Always creates a Role.USER account (Admin accounts are ' +
      'created separately via POST /users by an existing admin). Returns a JWT immediately.',
  })
  @ApiSuccessResponse(AuthResponseDto, 201)
  @ApiValidationError()
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { message: 'Registration successful', data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Log in with email and password',
    description: 'Returns a JWT bearer token and the authenticated user profile.',
  })
  @ApiSuccessResponse(AuthResponseDto, 200)
  @ApiValidationError()
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { message: 'Login successful', data };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Email a new password to the account',
    description:
      'Always responds 200 whether or not the account exists (prevents account enumeration). If it ' +
      'does exist, a newly generated password is emailed straight to it and the old password stops ' +
      'working immediately — the stored password is a bcrypt hash, so the original cannot be ' +
      'recovered or sent. The new password is never returned in this response, only emailed. Pass ' +
      '`userType` to pick which account when one email owns both a buyer and a seller account.',
  })
  @ApiSuccessResponse(ForgotPasswordResponseDto, 200)
  @ApiValidationError()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const data = await this.authService.forgotPassword(dto);
    return {
      message: 'If an account with those details exists, a new password has been emailed to it.',
      data,
    };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: "Change the current user's own password",
    description: 'Any authenticated account. Requires the current password to confirm identity.',
  })
  @ApiValidationError()
  @ApiUnauthorizedResponse({ description: 'Missing/invalid token, or the current password is wrong' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.changePassword(user, dto);
    return { message: 'Password changed successfully', data: null };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get the current authenticated user',
    description: 'Returns the profile of the user identified by the bearer token.',
  })
  @ApiSuccessResponse(UserResponseDto, 200)
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.findOne(user.id);
    return { message: 'Current user retrieved successfully', data };
  }
}
