import { Module } from '@nestjs/common';
import { PropertyDocumentsController } from '../controllers/property-documents.controller.js';
import { PropertyDocumentsService } from '../services/property-documents.service.js';

@Module({
  controllers: [PropertyDocumentsController],
  providers: [PropertyDocumentsService]
})
export class PropertyDocumentsModule {}
