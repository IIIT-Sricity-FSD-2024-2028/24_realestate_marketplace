import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 1500 })
  amount: number;

  @ApiProperty({ example: 'CREDIT_CARD' })
  method: string;

  @ApiProperty({ example: 'usr_001' })
  payerId: string;

  @ApiProperty({ example: 'tx_001' })
  transactionId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
