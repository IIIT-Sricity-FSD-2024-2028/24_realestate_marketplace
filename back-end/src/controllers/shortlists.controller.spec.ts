import { Test, TestingModule } from '@nestjs/testing';
import { ShortlistsController } from './shortlists.controller.js';

describe('ShortlistsController', () => {
  let controller: ShortlistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortlistsController],
    }).compile();

    controller = module.get<ShortlistsController>(ShortlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
