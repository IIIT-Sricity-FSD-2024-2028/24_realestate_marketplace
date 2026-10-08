import { ApiProperty } from '@nestjs/swagger';

export class BankAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'usr_001' })
  userId: string;

  @ApiProperty({ example: '1234567890' })
  accountNumber: string;

  @ApiProperty({ example: 'Chase' })
  bankName: string;

  @ApiProperty({ example: 'CHAS0001' })
  ifsc: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
