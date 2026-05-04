import { ApiProperty } from '@nestjs/swagger';

export class AgentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Agent Smith' })
  name: string;

  @ApiProperty({ example: 'agent@example.com' })
  email: string;

  @ApiProperty({ example: 'LIC-12345' })
  licenseNumber: string;

  @ApiProperty({ example: 'Prime Properties' })
  agencyName: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
