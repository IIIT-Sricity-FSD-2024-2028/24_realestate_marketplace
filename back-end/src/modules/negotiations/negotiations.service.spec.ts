import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NegotiationsService } from './negotiations.service.js';
import { Negotiation } from './schemas/negotiation.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { PurchasesService } from '../purchases/purchases.service.js';

describe('NegotiationsService', () => {
  let service: NegotiationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegotiationsService,
        { provide: getModelToken(Negotiation.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
        { provide: PurchasesService, useValue: {} },
      ],
    }).compile();

    service = module.get<NegotiationsService>(NegotiationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
