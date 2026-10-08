import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { PropertyDocumentsController } from './property-documents.controller.js';
import { PropertyDocumentsService } from './property-documents.service.js';

describe('PropertyDocumentsController', () => {
  let controller: PropertyDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyDocumentsController],
      providers: [PropertyDocumentsService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    controller = module.get<PropertyDocumentsController>(PropertyDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
