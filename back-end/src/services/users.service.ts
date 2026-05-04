import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UpdateUserDto } from '../users/dto/update-user.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  // In-memory store — replace with TypeORM/Prisma repository in production
  private readonly users: Map<string, UserEntity> = new Map();
  private counter = 0;

  private generateId(): string {
    return `usr_${String(++this.counter).padStart(6, '0')}`;
  }

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserResponseDto['role'],
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  create(dto: CreateUserDto): UserResponseDto {
    // Check email uniqueness
    const existing = [...this.users.values()].find(
      (u) => u.email === dto.email,
    );
    if (existing) {
      throw new ConflictException(
        `A user with email "${dto.email}" already exists`,
      );
    }

    const now = new Date();
    const user: UserEntity = {
      id: this.generateId(),
      name: dto.name,
      email: dto.email,
      passwordHash: `hashed_${dto.password}`, // Replace with bcrypt in production
      role: dto.role,
      phone: dto.phone ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return this.toResponse(user);
  }

  findAll(): UserResponseDto[] {
    return [...this.users.values()].map(this.toResponse.bind(this));
  }

  findOne(id: string): UserResponseDto {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return this.toResponse(user);
  }

  update(id: string, dto: UpdateUserDto): UserResponseDto {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Check email uniqueness if email is being changed
    if (dto.email && dto.email !== user.email) {
      const conflict = [...this.users.values()].find(
        (u) => u.email === dto.email && u.id !== id,
      );
      if (conflict) {
        throw new ConflictException(
          `A user with email "${dto.email}" already exists`,
        );
      }
    }

    const updated: UserEntity = {
      ...user,
      ...(dto.name && { name: dto.name }),
      ...(dto.email && { email: dto.email }),
      ...(dto.role && { role: dto.role }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      updatedAt: new Date(),
    };

    this.users.set(id, updated);
    return this.toResponse(updated);
  }

  remove(id: string): void {
    if (!this.users.has(id)) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.users.delete(id);
  }
}
