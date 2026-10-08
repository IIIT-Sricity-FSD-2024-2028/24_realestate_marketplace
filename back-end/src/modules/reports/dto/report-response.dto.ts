import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'admin_01' })
  generatedBy: string;

  @ApiProperty({ example: 'SALES_SUMMARY' })
  reportType: string;

  @ApiProperty({ example: 'Q1 Sales Data...' })
  content: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
