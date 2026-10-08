import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service.js';
import { Purchase } from './schemas/purchase.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';

describe('PurchasesService', () => {
  let service: PurchasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: getModelToken(Purchase.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
        // Completing a purchase books the platform's commission on the deal.
        { provide: CommissionsService, useValue: { accrueForPurchase: jest.fn() } },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
