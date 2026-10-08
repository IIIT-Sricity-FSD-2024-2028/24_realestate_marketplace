import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../schemas/user.schema.js';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated full name',
    example: 'Jane Smith',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated email address',
    example: 'jane.smith@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated role',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @ApiPropertyOptional({
    description: 'Updated sub-category for Role.USER accounts',
    enum: UserType,
    example: UserType.SELLER,
  })
  @IsOptional()
  @IsEnum(UserType, {
    message: `userType must be one of: ${Object.values(UserType).join(', ')}`,
  })
  userType?: UserType;

  @ApiPropertyOptional({
    description: 'Updated phone number',
    example: '+911234567890',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Informational city for this account — no longer restricts what an admin can act on.',
    example: 'Chennai',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Informational state for this account (optional refinement of `city`) — no longer restricts what an admin can act on.',
    example: 'Tamil Nadu',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Block or unblock the account. Blocked accounts cannot log in, and any active session is invalidated immediately.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
