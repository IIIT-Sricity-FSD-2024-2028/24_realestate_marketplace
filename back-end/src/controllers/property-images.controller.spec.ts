import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImagesController } from './property-images.controller.js';

describe('PropertyImagesController', () => {
  let controller: PropertyImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyImagesController],
    }).compile();

    controller = module.get<PropertyImagesController>(PropertyImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
