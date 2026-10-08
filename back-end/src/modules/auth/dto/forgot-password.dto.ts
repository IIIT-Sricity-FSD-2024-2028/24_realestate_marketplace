import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserType } from '../../users/schemas/user.schema.js';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description:
      'Which account to reset when the same email owns more than one (buyer/seller). Omit for admin/superuser accounts.',
    enum: UserType,
    example: UserType.BUYER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}
