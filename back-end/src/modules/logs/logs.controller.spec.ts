import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller.js';
import { LogsService } from './logs.service.js';

describe('LogsController', () => {
  let controller: LogsController;
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [LogsService],
    }).compile();

    controller = module.get<LogsController>(LogsController);
    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lists every channel in the standard envelope', () => {
    jest.spyOn(service, 'summary').mockReturnValue([]);

    expect(controller.summary()).toEqual({
      message: 'Log files retrieved successfully',
      data: [],
    });
  });

  it('passes the tail options through to the service', async () => {
    const read = jest
      .spyOn(service, 'read')
      .mockResolvedValue({ channel: 'error', file: 'error-2026-01-01.log', count: 0, entries: [] });

    await controller.read({ channel: 'error' }, { lines: 25, level: 'error' });

    expect(read).toHaveBeenCalledWith('error', { lines: 25, level: 'error' });
  });
});
