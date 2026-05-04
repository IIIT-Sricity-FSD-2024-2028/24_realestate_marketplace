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
import { BankAccountsService } from '../services/bank-accounts.service.js';
import { CreateBankAccountDto } from '../bank-accounts/dto/create-bank-account.dto.js';
import { UpdateBankAccountDto } from '../bank-accounts/dto/update-bank-account.dto.js';
import { BankAccountResponseDto } from '../bank-accounts/dto/bank-account-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('BankAccounts')
@ApiExtraModels(BankAccountResponseDto)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new bank-account' })
  @ApiSuccessResponse(BankAccountResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateBankAccountDto) {
    const data = this.service.create(dto);
    return { message: 'BankAccount created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all bank-accounts' })
  @ApiSuccessResponse(BankAccountResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'BankAccounts retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank-account by ID' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiSuccessResponse(BankAccountResponseDto)
  @ApiNotFound('BankAccount')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'BankAccount retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a bank-account' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiSuccessResponse(BankAccountResponseDto)
  @ApiNotFound('BankAccount')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    const data = this.service.update(id, dto);
    return { message: 'BankAccount updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a bank-account' })
  @ApiParam({ name: 'id', description: 'BankAccount ID' })
  @ApiNotFound('BankAccount')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'BankAccount deleted successfully', data: null };
  }
}
