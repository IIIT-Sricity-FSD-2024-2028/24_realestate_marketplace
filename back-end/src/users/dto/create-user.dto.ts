import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Valid email address — used as login identifier',
    example: 'jane.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description:
      'Password: 8–32 characters, must include uppercase, lowercase, digit, and special character',
    example: 'Secure@123',
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User role on the platform',
    enum: Role,
    example: Role.BUYER,
  })
  @IsEnum(Role, {
    message: `Role must be one of: ${Object.values(Role).join(', ')}`,
  })
  role: Role;

  @ApiProperty({
    description: 'Contact phone number (E.164 format preferred)',
    example: '+911234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;
}
