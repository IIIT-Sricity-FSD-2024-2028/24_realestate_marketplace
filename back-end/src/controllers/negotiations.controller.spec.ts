import { Test, TestingModule } from '@nestjs/testing';
import { NegotiationsController } from './negotiations.controller.js';

describe('NegotiationsController', () => {
  let controller: NegotiationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegotiationsController],
    }).compile();

    controller = module.get<NegotiationsController>(NegotiationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
