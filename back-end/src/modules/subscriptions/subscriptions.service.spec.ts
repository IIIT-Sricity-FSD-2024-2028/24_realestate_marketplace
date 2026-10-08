import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionsService } from './subscriptions.service.js';
import { Subscription } from './schemas/subscription.schema.js';
import { PLAN_CATALOG } from '../../shared/constants/pricing.js';
import { PlanTier } from '../../shared/enums/billing.enum.js';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: getModelToken(Subscription.name), useValue: {} },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasListingHeadroom', () => {
    const state = (tier: PlanTier) => ({
      tier,
      definition: PLAN_CATALOG[tier],
      subscription: null,
    });

    it('allows a listing while the free tier still has room', () => {
      expect(service.hasListingHeadroom(state(PlanTier.FREE), 0)).toBe(true);
      expect(service.hasListingHeadroom(state(PlanTier.FREE), 1)).toBe(true);
    });

    it('blocks the listing that would exceed the quota', () => {
      expect(service.hasListingHeadroom(state(PlanTier.FREE), 2)).toBe(false);
      expect(service.hasListingHeadroom(state(PlanTier.SILVER), 10)).toBe(false);
    });

    it('never blocks an unlimited plan', () => {
      expect(service.hasListingHeadroom(state(PlanTier.GOLD), 5_000)).toBe(true);
    });
  });
});
