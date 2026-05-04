import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDocumentsService } from './property-documents.service.js';

describe('PropertyDocumentsService', () => {
  let service: PropertyDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyDocumentsService],
    }).compile();

    service = module.get<PropertyDocumentsService>(PropertyDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
