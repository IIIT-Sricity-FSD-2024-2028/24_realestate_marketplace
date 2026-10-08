import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PropertiesService } from './properties.service.js';
import { Property } from './schemas/property.schema.js';
import { UsersService } from '../users/users.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: getModelToken(Property.name), useValue: {} },
        // PropertiesService resolves a property's city admin through this.
        { provide: UsersService, useValue: { findAdminForCity: jest.fn() } },
        // A seller's plan decides their listing quota, checked on create().
        {
          provide: SubscriptionsService,
          useValue: { activePlan: jest.fn(), hasListingHeadroom: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
