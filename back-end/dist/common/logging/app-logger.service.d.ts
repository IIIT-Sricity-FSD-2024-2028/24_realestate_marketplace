import { ConsoleLogger, LoggerService, LogLevel as NestLogLevel } from '@nestjs/common';
export declare class AppLogger extends ConsoleLogger implements LoggerService {
    log(message: unknown, ...rest: unknown[]): void;
    warn(message: unknown, ...rest: unknown[]): void;
    debug(message: unknown, ...rest: unknown[]): void;
    verbose(message: unknown, ...rest: unknown[]): void;
    fatal(message: unknown, ...rest: unknown[]): void;
    error(message: unknown, ...rest: unknown[]): void;
    setLogLevels(levels: NestLogLevel[]): void;
    protected getTimestamp(): string;
    private persist;
}
