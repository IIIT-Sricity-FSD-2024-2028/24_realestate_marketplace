import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ShortlistsService } from './shortlists.service.js';

describe('ShortlistsService', () => {
  let service: ShortlistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortlistsService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    service = module.get<ShortlistsService>(ShortlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
