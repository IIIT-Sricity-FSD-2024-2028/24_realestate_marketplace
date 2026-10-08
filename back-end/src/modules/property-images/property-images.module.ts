import { Module } from '@nestjs/common';
import { PropertyImagesController } from './property-images.controller.js';
import { PropertyImagesService } from './property-images.service.js';

@Module({
  controllers: [PropertyImagesController],
  providers: [PropertyImagesService]
})
export class PropertyImagesModule {}
