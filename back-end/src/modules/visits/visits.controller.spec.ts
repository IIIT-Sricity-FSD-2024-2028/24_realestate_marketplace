import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VisitsController } from './visits.controller.js';
import { VisitsService } from './visits.service.js';
import { Visit } from './schemas/visit.schema.js';
import { PropertiesService } from '../properties/properties.service.js';

describe('VisitsController', () => {
  let controller: VisitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController],
      providers: [
        VisitsService,
        { provide: getModelToken(Visit.name), useValue: {} },
        { provide: PropertiesService, useValue: {} },
      ],
    }).compile();

    controller = module.get<VisitsController>(VisitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
