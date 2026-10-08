import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
import { Negotiation } from './schemas/negotiation.schema.js';
import { PropertiesService } from '../properties/properties.service.js';
import { PurchasesService } from '../purchases/purchases.service.js';

describe('NegotiationsController', () => {
  let controller: NegotiationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegotiationsController],
      providers: [
        NegotiationsService,
        { provide: getModelToken(Negotiation.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
        { provide: PurchasesService, useValue: {} },
      ],
    }).compile();

    controller = module.get<NegotiationsController>(NegotiationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
