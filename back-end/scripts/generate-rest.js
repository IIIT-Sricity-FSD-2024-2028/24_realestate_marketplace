const fs = require('fs');
const path = require('path');

const dirs = [
  'admins', 'bank-accounts', 'buyers', 'negotiations', 
  'notifications', 'payments', 'property-documents', 'property-images', 
  'purchases', 'reports', 'sellers', 'shortlists', 'visits'
];

dirs.forEach(dir => {
  const name = dir;
  const className = name.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');
  const controllerPath = path.join(__dirname, 'src', name, `${name}.controller.ts`);
  const servicePath = path.join(__dirname, 'src', name, `${name}.service.ts`);
  
  if (fs.existsSync(controllerPath)) {
    const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ${className}Service } from './${name}.service.js';

@Controller('${name}')
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
`;
    fs.writeFileSync(controllerPath, controllerContent);
  }

  if (fs.existsSync(servicePath)) {
    const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ${className}Service {
  private readonly items = new Map<string, any>();
  private counter = 0;

  create(dto: any) {
    const id = \`${name}_\${++this.counter}\`;
    const item = { id, ...dto, createdAt: new Date() };
    this.items.set(id, item);
    return item;
  }

  findAll() {
    return Array.from(this.items.values());
  }

  findOne(id: string) {
    const item = this.items.get(id);
    if (!item) throw new NotFoundException(\`Item \${id} not found\`);
    return item;
  }

  update(id: string, dto: any) {
    const item = this.findOne(id);
    const updated = { ...item, ...dto, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  remove(id: string) {
    this.findOne(id);
    this.items.delete(id);
  }
}
`;
    fs.writeFileSync(servicePath, serviceContent);
  }
});
console.log('Done generating controllers and services');
