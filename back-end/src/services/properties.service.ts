import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from '../properties/dto/create-property.dto.js';
import { UpdatePropertyDto } from '../properties/dto/update-property.dto.js';
import { PropertyResponseDto } from '../properties/dto/property-response.dto.js';
import {
  ListingType,
  PropertyStatus,
  PropertyType,
} from '../common/enums/property.enum.js';

interface PropertyEntity {
  id: string;
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  status: string;
  images: string[];
  agentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PropertiesService {
  private readonly properties: Map<string, PropertyEntity> = new Map();
  private counter = 0;

  constructor() {
    this.seed();
  }

  private generateId(): string {
    return `prop_${String(++this.counter).padStart(6, '0')}`;
  }

  private seed(): void {
    if (this.properties.size > 0) return;

    const seedProperties: CreatePropertyDto[] = [
      {
        title: 'Modern Downtown Apartment',
        description:
          'A beautifully designed 2BHK apartment with modern interiors, spacious balcony, and quick access to business districts.',
        type: PropertyType.APARTMENT,
        listingType: ListingType.SALE,
        price: 4500000,
        areaSqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        status: PropertyStatus.APPROVED,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80'],
        agentId: 'usr_000002',
      },
      {
        title: 'Luxury Villa with Garden',
        description:
          'An exclusive villa with private garden, premium finishes, large living area, and secure parking in a prime neighborhood.',
        type: PropertyType.VILLA,
        listingType: ListingType.SALE,
        price: 12500000,
        areaSqft: 2800,
        bedrooms: 4,
        bathrooms: 3,
        address: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        status: PropertyStatus.APPROVED,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80'],
        agentId: 'usr_000002',
      },
      {
        title: 'Spacious 3BHK Apartment',
        description:
          'A well-maintained 3BHK home near technology parks, schools, hospitals, and shopping areas.',
        type: PropertyType.APARTMENT,
        listingType: ListingType.SALE,
        price: 9500000,
        areaSqft: 1800,
        bedrooms: 3,
        bathrooms: 2,
        address: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        status: PropertyStatus.APPROVED,
        images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=900&q=80'],
        agentId: 'usr_000002',
      },
    ];

    seedProperties.forEach((dto) => {
      const now = new Date();
      const property: PropertyEntity = {
        id: this.generateId(),
        ...dto,
        status: dto.status ?? PropertyStatus.APPROVED,
        images: dto.images ?? [],
        agentId: dto.agentId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.properties.set(property.id, property);
    });
  }

  private toResponse(p: PropertyEntity): PropertyResponseDto {
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type as PropertyResponseDto['type'],
      listingType: p.listingType as PropertyResponseDto['listingType'],
      price: p.price,
      areaSqft: p.areaSqft,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      address: p.address,
      city: p.city,
      state: p.state,
      status: p.status as PropertyResponseDto['status'],
      images: p.images,
      agentId: p.agentId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  create(dto: CreatePropertyDto): PropertyResponseDto {
    const now = new Date();
    const property: PropertyEntity = {
      id: this.generateId(),
      ...dto,
      status: dto.status ?? PropertyStatus.PENDING,
      images: dto.images ?? [],
      agentId: dto.agentId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.properties.set(property.id, property);
    return this.toResponse(property);
  }

  findAll(): PropertyResponseDto[] {
    return [...this.properties.values()].map(this.toResponse.bind(this));
  }

  findOne(id: string): PropertyResponseDto {
    const property = this.properties.get(id);
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return this.toResponse(property);
  }

  update(id: string, dto: UpdatePropertyDto): PropertyResponseDto {
    const property = this.properties.get(id);
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    const updated: PropertyEntity = {
      ...property,
      ...changes,
      images: dto.images ?? property.images,
      agentId: dto.agentId !== undefined ? dto.agentId : property.agentId,
      updatedAt: new Date(),
    };
    this.properties.set(id, updated);
    return this.toResponse(updated);
  }

  remove(id: string): void {
    if (!this.properties.has(id)) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    this.properties.delete(id);
  }
}
