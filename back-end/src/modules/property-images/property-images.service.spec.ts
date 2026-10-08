import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { PropertyImagesService } from './property-images.service.js';

describe('PropertyImagesService', () => {
  let service: PropertyImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyImagesService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    service = module.get<PropertyImagesService>(PropertyImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
