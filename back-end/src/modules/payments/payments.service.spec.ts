import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service.js';
import { Payment } from './schemas/payment.schema.js';
import { PAYMENT_GATEWAY } from './gateway/payment-gateway.interface.js';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getModelToken(Payment.name), useValue: {} },
        {
          provide: PAYMENT_GATEWAY,
          useValue: { name: 'mock', isLive: false, createOrder: jest.fn(), verifySignature: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('exposes the active driver so the UI can flag test mode', () => {
    expect(service.gatewayName).toBe('mock');
    expect(service.isLive).toBe(false);
  });
});
