import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PropertiesService } from './properties.service.js';
import { Property } from './schemas/property.schema.js';
import { UsersService } from '../users/users.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { Types } from 'mongoose';
import {
  ListingType,
  PropertyStatus,
  PropertyVerificationStatus,
  PropertyType,
} from '../../shared/enums/property.enum.js';

describe('PropertiesService', () => {
  let service: PropertiesService;
  const propertyModel = { findOneAndUpdate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: getModelToken(Property.name), useValue: propertyModel },
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

  it('atomically reserves only an available, verified listing within its asking price', async () => {
    const propertyId = new Types.ObjectId().toString();
    propertyModel.findOneAndUpdate.mockResolvedValue({
      _id: new Types.ObjectId(propertyId),
      title: 'Spacious Apartment in Chennai',
      description: 'A furnished three bedroom apartment with a large balcony.',
      type: PropertyType.APARTMENT,
      listingType: ListingType.SALE,
      price: 8_000_000,
      areaSqft: 1200,
      bedrooms: 3,
      bathrooms: 2,
      address: 'Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      status: PropertyStatus.UNDER_OFFER,
      images: [],
      adminId: null,
      sellerId: null,
      verificationStatus: PropertyVerificationStatus.VERIFIED,
      rejectionReason: null,
      featuredUntil: null,
      featuredTier: null,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.reserveForOffer(propertyId, 7_500_000);

    expect(propertyModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: propertyId,
        verificationStatus: PropertyVerificationStatus.VERIFIED,
        status: PropertyStatus.AVAILABLE,
        price: { $gte: 7_500_000 },
      },
      { $set: { status: PropertyStatus.UNDER_OFFER } },
      { new: true },
    );
  });
});
