import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserDocument, UserType } from './schemas/user.schema.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class UsersService implements OnModuleInit {
    private readonly userModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>);
    onModuleInit(): Promise<void>;
    toResponse(user: UserDocument): UserResponseDto;
    private assertCanModifyTarget;
    private assertValidId;
    static hashPassword(plain: string): Promise<string>;
    private describeAccountType;
    create(dto: CreateUserDto, actor?: AuthenticatedUser): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
    findOne(id: string): Promise<UserResponseDto>;
    findAccountForAuth(email: string, userType?: UserType | null): Promise<UserDocument | null>;
    findDocumentById(id: string): Promise<UserDocument | null>;
    findDocumentByIdForAuth(id: string): Promise<UserDocument | null>;
    private assertCityIsFree;
    findAdminForCity(city?: string | null): Promise<UserDocument | null>;
    update(id: string, dto: UpdateUserDto, actor: AuthenticatedUser): Promise<UserResponseDto>;
    remove(id: string, actor: AuthenticatedUser): Promise<void>;
    resetPassword(userId: string, newPasswordHash: string): Promise<void>;
}
