const fs = require('fs');
const path = require('path');

const schemas = {
  'admins': [
    { name: 'name', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'John Doe'" },
    { name: 'email', type: 'string', validator: '@IsEmail()\n  @IsNotEmpty()', apiType: 'string', example: "'admin@example.com'" },
    { name: 'level', type: 'number', validator: '@IsNumber()\n  @Min(1)\n  @Max(5)', apiType: 'number', example: "1" }
  ],
  'bank-accounts': [
    { name: 'userId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'accountNumber', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'1234567890'" },
    { name: 'bankName', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'Chase'" },
    { name: 'ifsc', type: 'string', validator: '@IsString()\n  @IsOptional()', apiType: 'string', example: "'CHAS0001'", optional: true }
  ],
  'buyers': [
    { name: 'name', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'Buyer Bob'" },
    { name: 'email', type: 'string', validator: '@IsEmail()\n  @IsNotEmpty()', apiType: 'string', example: "'bob@example.com'" },
    { name: 'preferredLocations', type: 'string[]', validator: '@IsArray()\n  @IsString({ each: true })\n  @IsOptional()', apiType: '[String]', example: "['NY', 'CA']", optional: true }
  ],
  'negotiations': [
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" },
    { name: 'buyerId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_002'" },
    { name: 'offeredPrice', type: 'number', validator: '@IsNumber()\n  @IsPositive()', apiType: 'number', example: "500000" },
    { name: 'status', type: 'string', validator: '@IsString()\n  @IsOptional()', apiType: 'string', example: "'PENDING'", optional: true }
  ],
  'notifications': [
    { name: 'userId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'message', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'Your offer was accepted!'" },
    { name: 'read', type: 'boolean', validator: '@IsBoolean()\n  @IsOptional()', apiType: 'boolean', example: "false", optional: true }
  ],
  'payments': [
    { name: 'amount', type: 'number', validator: '@IsNumber()\n  @IsPositive()', apiType: 'number', example: "1500" },
    { name: 'method', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'CREDIT_CARD'" },
    { name: 'payerId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'transactionId', type: 'string', validator: '@IsString()\n  @IsOptional()', apiType: 'string', example: "'tx_001'", optional: true }
  ],
  'property-documents': [
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" },
    { name: 'documentType', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'DEED'" },
    { name: 'fileUrl', type: 'string', validator: '@IsUrl()\n  @IsNotEmpty()', apiType: 'string', example: "'https://example.com/doc.pdf'" }
  ],
  'property-images': [
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" },
    { name: 'imageUrl', type: 'string', validator: '@IsUrl()\n  @IsNotEmpty()', apiType: 'string', example: "'https://example.com/img.jpg'" },
    { name: 'caption', type: 'string', validator: '@IsString()\n  @IsOptional()', apiType: 'string', example: "'Living Room'", optional: true }
  ],
  'purchases': [
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" },
    { name: 'buyerId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'finalPrice', type: 'number', validator: '@IsNumber()\n  @IsPositive()', apiType: 'number', example: "450000" }
  ],
  'reports': [
    { name: 'generatedBy', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'admin_01'" },
    { name: 'reportType', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'SALES_SUMMARY'" },
    { name: 'content', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'Q1 Sales Data...'" }
  ],
  'sellers': [
    { name: 'name', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'Seller Sam'" },
    { name: 'email', type: 'string', validator: '@IsEmail()\n  @IsNotEmpty()', apiType: 'string', example: "'sam@example.com'" },
    { name: 'taxId', type: 'string', validator: '@IsString()\n  @IsOptional()', apiType: 'string', example: "'TAX-999'", optional: true }
  ],
  'shortlists': [
    { name: 'userId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" }
  ],
  'visits': [
    { name: 'propertyId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'prop_001'" },
    { name: 'visitorId', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'usr_001'" },
    { name: 'scheduledDate', type: 'string', validator: '@IsString()\n  @IsNotEmpty()', apiType: 'string', example: "'2026-06-01T10:00:00Z'" }
  ]
};

Object.keys(schemas).forEach(name => {
  const singularName = name.endsWith('s') ? name.slice(0, -1) : name;
  const singularClassName = singularName.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
  const fields = schemas[name];

  const dtoDirPath = path.join(__dirname, 'src', name, 'dto');
  if (!fs.existsSync(dtoDirPath)) return;

  const createDtoPath = path.join(dtoDirPath, `create-${singularName}.dto.ts`);
  const updateDtoPath = path.join(dtoDirPath, `update-${singularName}.dto.ts`);
  const responseDtoPath = path.join(dtoDirPath, `${singularName}-response.dto.ts`);

  let createContent = `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max, IsPositive, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class Create${singularClassName}Dto {
`;

  let responseContent = `import { ApiProperty } from '@nestjs/swagger';

export class ${singularClassName}ResponseDto {
  @ApiProperty()
  id: string;

`;

  fields.forEach(f => {
    createContent += `  @ApiProperty({ example: ${f.example}${f.optional ? ', required: false' : ''} })
  ${f.validator}
  ${f.name}${f.optional ? '?' : ''}: ${f.type};

`;
    responseContent += `  @ApiProperty({ example: ${f.example} })
  ${f.name}: ${f.type};

`;
  });

  createContent += `}\n`;
  
  responseContent += `  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}\n`;

  const updateContent = `import { PartialType } from '@nestjs/swagger';
import { Create${singularClassName}Dto } from './create-${singularName}.dto.js';

export class Update${singularClassName}Dto extends PartialType(Create${singularClassName}Dto) {}
`;

  fs.writeFileSync(createDtoPath, createContent);
  fs.writeFileSync(updateDtoPath, updateContent);
  fs.writeFileSync(responseDtoPath, responseContent);
});

console.log('Done generating full fields for DTOs');
