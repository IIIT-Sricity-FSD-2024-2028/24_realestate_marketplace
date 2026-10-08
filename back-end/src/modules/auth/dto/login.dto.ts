import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from '../../users/schemas/user.schema.js';

export class LoginDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Secure@123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description:
      'Which account to log into when the same email owns more than one ' +
      '(e.g. a buyer account and a seller account). Omit for admin accounts.',
    enum: UserType,
    example: UserType.BUYER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserType, {
    message: `userType must be one of: ${Object.values(UserType).join(', ')}`,
  })
  userType?: UserType;
}
