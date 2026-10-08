import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { CommissionsService } from '../commissions/commissions.service.js';
import { PropertiesService } from '../properties/properties.service.js';
import { PLAN_TIERS } from '../../shared/constants/pricing.js';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PaymentsService, useValue: { gatewayName: 'mock', isLive: false } },
        { provide: SubscriptionsService, useValue: {} },
        { provide: CommissionsService, useValue: {} },
        { provide: PropertiesService, useValue: {} },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('catalog', () => {
    it('publishes every plan with a price for every billing cycle', () => {
      const catalog = service.catalog();
      expect(catalog.plans).toHaveLength(PLAN_TIERS.length);
      for (const plan of catalog.plans as { pricing: Record<string, { total: number }> }[]) {
        for (const cycle of catalog.cycles as { key: string }[]) {
          expect(plan.pricing[cycle.key]).toBeDefined();
          expect(typeof plan.pricing[cycle.key].total).toBe('number');
        }
      }
    });

    it('reports the active gateway so the dashboards can flag test mode', () => {
      const catalog = service.catalog();
      expect(catalog.gateway).toBe('mock');
      expect(catalog.isLive).toBe(false);
    });

    it('quotes GST-inclusive totals on the promotion packs', () => {
      for (const pack of service.catalog().featuredPacks as { price: number; tax: number; total: number }[]) {
        expect(pack.total).toBe(pack.price + pack.tax);
      }
    });
  });
});
