const fs = require('fs');
const path = require('path');

const dirs = [
  'admins', 'bank-accounts', 'buyers', 'negotiations', 
  'notifications', 'payments', 'property-documents', 'property-images', 
  'purchases', 'reports', 'sellers', 'shortlists', 'visits'
];

dirs.forEach(dir => {
  const name = dir;
  // e.g. bank-accounts -> BankAccounts
  const className = name.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
  const singularName = name.endsWith('s') ? name.slice(0, -1) : name;
  const singularClassName = singularName.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');

  const dirPath = path.join(__dirname, 'src', name);
  const dtoDirPath = path.join(dirPath, 'dto');
  const controllerPath = path.join(dirPath, `${name}.controller.ts`);
  
  if (!fs.existsSync(dirPath)) return;

  // Create DTO directory
  if (!fs.existsSync(dtoDirPath)) {
    fs.mkdirSync(dtoDirPath);
  }

  // Generate DTOs
  const createDtoPath = path.join(dtoDirPath, `create-${singularName}.dto.ts`);
  const updateDtoPath = path.join(dtoDirPath, `update-${singularName}.dto.ts`);
  const responseDtoPath = path.join(dtoDirPath, `${singularName}-response.dto.ts`);

  fs.writeFileSync(createDtoPath, `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class Create${singularClassName}Dto {
  @ApiProperty({ description: 'Placeholder field' })
  @IsString()
  @IsNotEmpty()
  field: string;
}
`);

  fs.writeFileSync(updateDtoPath, `import { PartialType } from '@nestjs/swagger';
import { Create${singularClassName}Dto } from './create-${singularName}.dto.js';

export class Update${singularClassName}Dto extends PartialType(Create${singularClassName}Dto) {}
`);

  fs.writeFileSync(responseDtoPath, `import { ApiProperty } from '@nestjs/swagger';

export class ${singularClassName}ResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  field: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
`);

  // Generate Controller with Swagger & Roles
  const controllerContent = `import {
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
import { ${className}Service } from './${name}.service.js';
import { Create${singularClassName}Dto } from './dto/create-${singularName}.dto.js';
import { Update${singularClassName}Dto } from './dto/update-${singularName}.dto.js';
import { ${singularClassName}ResponseDto } from './dto/${singularName}-response.dto.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiRole } from '../common/decorators/api-role.decorator.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../common/decorators/api-response.decorator.js';

@ApiTags('${className}')
@ApiExtraModels(${singularClassName}ResponseDto)
@Controller('${name}')
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new ${singularName}' })
  @ApiSuccessResponse(${singularClassName}ResponseDto, 201)
  @ApiValidationError()
  create(@Body() dto: Create${singularClassName}Dto) {
    const data = this.service.create(dto);
    return { message: '${singularClassName} created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all ${name}' })
  @ApiSuccessResponse(${singularClassName}ResponseDto, 200, true)
  findAll() {
    const data = this.service.findAll();
    return { message: '${className} retrieved successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${singularName} by ID' })
  @ApiParam({ name: 'id', description: '${singularClassName} ID' })
  @ApiSuccessResponse(${singularClassName}ResponseDto)
  @ApiNotFound('${singularClassName}')
  findOne(@Param('id') id: string) {
    const data = this.service.findOne(id);
    return { message: '${singularClassName} retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Update a ${singularName}' })
  @ApiParam({ name: 'id', description: '${singularClassName} ID' })
  @ApiSuccessResponse(${singularClassName}ResponseDto)
  @ApiNotFound('${singularClassName}')
  @ApiValidationError()
  update(@Param('id') id: string, @Body() dto: Update${singularClassName}Dto) {
    const data = this.service.update(id, dto);
    return { message: '${singularClassName} updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a ${singularName}' })
  @ApiParam({ name: 'id', description: '${singularClassName} ID' })
  @ApiNotFound('${singularClassName}')
  remove(@Param('id') id: string) {
    this.service.remove(id);
    return { message: '${singularClassName} deleted successfully', data: null };
  }
}
`;
  fs.writeFileSync(controllerPath, controllerContent);

});
console.log('Done generating full DTOs and Controllers');
