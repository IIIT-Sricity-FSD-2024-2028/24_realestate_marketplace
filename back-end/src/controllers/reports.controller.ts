import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service.js';
import { CreateReportDto } from '../reports/dto/create-report.dto.js';
import { UpdateReportDto } from '../reports/dto/update-report.dto.js';
import { ReportResponseDto } from '../reports/dto/report-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Reports')
@ApiExtraModels(ReportResponseDto)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new report' })
  @ApiSuccessResponse(ReportResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateReportDto) {
    const data = this.service.create(dto);
    return { message: 'Report created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  @ApiSuccessResponse(ReportResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Reports retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiSuccessResponse(ReportResponseDto)
  @ApiNotFound('Report')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Report retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiSuccessResponse(ReportResponseDto)
  @ApiNotFound('Report')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    const data = this.service.update(id, dto);
    return { message: 'Report updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiNotFound('Report')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Report deleted successfully', data: null };
  }
}
