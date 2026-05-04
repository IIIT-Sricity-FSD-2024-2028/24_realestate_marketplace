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
import { AgentsService } from '../services/agents.service.js';
import { CreateAgentDto } from '../agents/dto/create-agent.dto.js';
import { UpdateAgentDto } from '../agents/dto/update-agent.dto.js';
import { AgentResponseDto } from '../agents/dto/agent-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('Agents')
@ApiExtraModels(AgentResponseDto)
@Controller('agents')
export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiSuccessResponse(AgentResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: CreateAgentDto) {
    const data = this.service.create(dto);
    return { message: 'Agent created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all agents' })
  @ApiSuccessResponse(AgentResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: 'Agents retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiSuccessResponse(AgentResponseDto)
  @ApiNotFound('Agent')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: 'Agent retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Update a agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiSuccessResponse(AgentResponseDto)
  @ApiNotFound('Agent')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    const data = this.service.update(id, dto);
    return { message: 'Agent updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.SUPERUSER)
  @ApiOperation({ summary: 'Delete a agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiNotFound('Agent')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: 'Agent deleted successfully', data: null };
  }
}
