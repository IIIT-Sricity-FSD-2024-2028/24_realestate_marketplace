import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ShortlistsController } from './shortlists.controller.js';
import { ShortlistsService } from './shortlists.service.js';

describe('ShortlistsController', () => {
  let controller: ShortlistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortlistsController],
      providers: [ShortlistsService, { provide: getConnectionToken(), useValue: {} }],
    }).compile();

    controller = module.get<ShortlistsController>(ShortlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
