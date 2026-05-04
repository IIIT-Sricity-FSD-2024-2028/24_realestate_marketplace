import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';

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
    example: Role.AGENT,
  })
  @IsOptional()
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @ApiPropertyOptional({
    description: 'Updated phone number',
    example: '+911234567890',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;
}
