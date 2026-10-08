import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PurchasesController } from './purchases.controller.js';
import { PurchasesService } from './purchases.service.js';
import { Purchase } from './schemas/purchase.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';

describe('PurchasesController', () => {
  let controller: PurchasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [
        PurchasesService,
        { provide: getModelToken(Purchase.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
        // Completing a purchase books the platform's commission on the deal.
        { provide: CommissionsService, useValue: { accrueForPurchase: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
