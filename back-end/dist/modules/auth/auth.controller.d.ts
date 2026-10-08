import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        message: string;
        data: AuthResponseDto;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        data: AuthResponseDto;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        data: ForgotPasswordResponseDto;
    }>;
    changePassword(dto: ChangePasswordDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
    me(user: AuthenticatedUser): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
}
