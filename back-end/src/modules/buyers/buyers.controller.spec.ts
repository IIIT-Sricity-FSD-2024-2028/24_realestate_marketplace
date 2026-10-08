import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { BuyersController } from './buyers.controller.js';
import { BuyersService } from './buyers.service.js';

describe('BuyersController', () => {
  let controller: BuyersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyersController],
      providers: [BuyersService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    controller = module.get<BuyersController>(BuyersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
