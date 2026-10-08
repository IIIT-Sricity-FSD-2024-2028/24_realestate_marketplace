import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommissionsService } from './commissions.service.js';
import { Commission } from './schemas/commission.schema.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';

describe('CommissionsService', () => {
  let service: CommissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionsService,
        { provide: getModelToken(Commission.name), useValue: {} },
        // A seller's plan discounts their commission rate.
        { provide: SubscriptionsService, useValue: { activePlan: jest.fn() } },
      ],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
