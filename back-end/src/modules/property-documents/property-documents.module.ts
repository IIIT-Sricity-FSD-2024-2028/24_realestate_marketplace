import { Module } from '@nestjs/common';
import { PropertyDocumentsController } from './property-documents.controller.js';
import { PropertyDocumentsService } from './property-documents.service.js';

@Module({
  controllers: [PropertyDocumentsController],
  providers: [PropertyDocumentsService]
})
export class PropertyDocumentsModule {}
