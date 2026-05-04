import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum.js';

export class UserResponseDto {
  @ApiProperty({ example: 'usr_01J8XKZM' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.BUYER })
  role: Role;

  @ApiProperty({ example: '+911234567890', nullable: true })
  phone: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  updatedAt: string;
}
