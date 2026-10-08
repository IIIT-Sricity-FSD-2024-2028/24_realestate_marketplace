import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VisitsService } from './visits.service.js';
import { Visit } from './schemas/visit.schema.js';
import { PropertiesService } from '../properties/properties.service.js';

describe('VisitsService', () => {
  let service: VisitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: getModelToken(Visit.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
