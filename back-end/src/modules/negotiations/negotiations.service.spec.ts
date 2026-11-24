import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NegotiationsService } from './negotiations.service.js';
import { Negotiation } from './schemas/negotiation.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { PurchasesService } from '../purchases/purchases.service.js';
import { Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum.js';
import { UserType } from '../users/schemas/user.schema.js';

describe('NegotiationsService', () => {
  let service: NegotiationsService;
  const negotiationModel = { create: jest.fn() };
  const propertiesService = {
    reserveForOffer: jest.fn(),
    releaseOfferHold: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegotiationsService,
        {
          provide: getModelToken(Negotiation.name),
          useValue: negotiationModel,
        },
        { provide: PropertiesService, useValue: propertiesService },
        { provide: PurchasesService, useValue: {} },
      ],
    }).compile();

    service = module.get<NegotiationsService>(NegotiationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reserves the listing before saving a buyer offer', async () => {
    const propertyId = new Types.ObjectId().toString();
    const buyerId = new Types.ObjectId().toString();
    negotiationModel.create.mockResolvedValue({
      _id: new Types.ObjectId(),
      propertyId,
      buyerId,
      offerAmount: 7_500_000,
      counterAmount: null,
      message: null,
      paymentMode: 'Cash',
      status: 'pending',
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.create(
      { propertyId, offerAmount: 7_500_000, paymentMode: 'Cash' },
      { id: buyerId, role: Role.USER, userType: UserType.BUYER },
    );

    expect(propertiesService.reserveForOffer).toHaveBeenCalledWith(
      propertyId,
      7_500_000,
    );
    expect(negotiationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId,
        buyerId,
        offerAmount: 7_500_000,
        status: 'pending',
      }),
    );
  });
});
