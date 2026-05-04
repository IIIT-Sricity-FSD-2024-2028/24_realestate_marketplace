import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'usr_001' })
  userId: string;

  @ApiProperty({ example: 'Your offer was accepted!' })
  message: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
