import { Module } from '@nestjs/common';
import { PropertyImagesController } from '../controllers/property-images.controller.js';
import { PropertyImagesService } from '../services/property-images.service.js';

@Module({
  controllers: [PropertyImagesController],
  providers: [PropertyImagesService]
})
export class PropertyImagesModule {}
