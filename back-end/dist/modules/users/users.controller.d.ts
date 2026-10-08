import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    findAll(): Promise<{
        message: string;
        data: UserResponseDto[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, actor: AuthenticatedUser): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    remove(id: string, actor: AuthenticatedUser): Promise<{
        message: string;
        data: null;
    }>;
}
