import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDocumentsController } from './property-documents.controller.js';

describe('PropertyDocumentsController', () => {
  let controller: PropertyDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyDocumentsController],
    }).compile();

    controller = module.get<PropertyDocumentsController>(PropertyDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
