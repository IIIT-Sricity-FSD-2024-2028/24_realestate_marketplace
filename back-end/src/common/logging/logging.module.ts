import { Global, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { FileLogger, fileLogger } from './file-logger.js';

/** DI token for the process-wide {@link FileLogger} singleton. */
export const FILE_LOGGER = 'FILE_LOGGER';

/**
 * Makes the file logger injectable anywhere (`@Inject(FILE_LOGGER)`) and ties its
 * flush timer to the application lifecycle, so a graceful shutdown always drains
 * whatever is still sitting in the buffer instead of dropping it.
 */
@Global()
@Module({
  providers: [{ provide: FILE_LOGGER, useValue: fileLogger }],
  exports: [FILE_LOGGER],
})
export class LoggingModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger: FileLogger = fileLogger;

  onModuleInit(): void {
    this.logger.start();
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.app('info', 'Application shutting down — flushing buffered logs', { signal });
    this.logger.stop();
  }
}
