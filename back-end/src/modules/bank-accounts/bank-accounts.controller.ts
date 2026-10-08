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
import { BankAccountsService } from './bank-accounts.service.js';
import { CreateBankAccountDto } from './dto/create-bank-account.dto.js';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto.js';
import { BankAccountResponseDto } from './dto/bank-account-response.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';

@ApiTags('BankAccounts')
@ApiExtraModels(BankAccountResponseDto)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new bank-account' })
  @ApiSuccessResponse(BankAccountResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreateBankAccountDto) {
    const data = await this.service.create(dto);
    return { message: 'BankAccount created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all bank-accounts' })
  @ApiSuccessResponse(BankAccountResponseDto, 200, true)
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'BankAccounts retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank-account by ID' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiSuccessResponse(BankAccountResponseDto)
  @ApiNotFound('BankAccount')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'BankAccount retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a bank-account' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiSuccessResponse(BankAccountResponseDto)
  @ApiNotFound('BankAccount')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    const data = await this.service.update(id, dto);
    return { message: 'BankAccount updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a bank-account' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiNotFound('BankAccount')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'BankAccount deleted successfully', data: null };
  }
}
