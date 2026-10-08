import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { PropertyImagesController } from './property-images.controller.js';
import { PropertyImagesService } from './property-images.service.js';

describe('PropertyImagesController', () => {
  let controller: PropertyImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyImagesController],
      providers: [PropertyImagesService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    controller = module.get<PropertyImagesController>(PropertyImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
