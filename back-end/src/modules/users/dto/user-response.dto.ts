import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum.js';
import { UserType } from '../schemas/user.schema.js';

export class UserResponseDto {
  @ApiProperty({ example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({
    enum: UserType,
    example: UserType.BUYER,
    nullable: true,
    description: 'Display-only sub-category for regular users (buyer/seller)',
  })
  userType: UserType | null;

  @ApiProperty({ example: '+911234567890', nullable: true })
  phone: string | null;

  @ApiProperty({
    example: 'Chennai',
    nullable: true,
    description: 'Informational city for this account — no longer restricts what an admin can act on',
  })
  city: string | null;

  @ApiProperty({
    example: 'Tamil Nadu',
    nullable: true,
    description: 'Informational state for this account — no longer restricts what an admin can act on',
  })
  state: string | null;

  @ApiProperty({ example: false, description: 'Blocked accounts cannot log in' })
  isBlocked: boolean;

  @ApiProperty({ example: '2025-01-01T05:30:00.000+05:30' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T05:30:00.000+05:30' })
  updatedAt: string;
}
