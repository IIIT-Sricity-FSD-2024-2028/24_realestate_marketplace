import { Test, TestingModule } from '@nestjs/testing';
import { NegotiationsService } from './negotiations.service.js';

describe('NegotiationsService', () => {
  let service: NegotiationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NegotiationsService],
    }).compile();

    service = module.get<NegotiationsService>(NegotiationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
