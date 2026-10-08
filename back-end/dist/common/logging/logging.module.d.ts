import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
export declare const FILE_LOGGER = "FILE_LOGGER";
export declare class LoggingModule implements OnModuleInit, OnApplicationShutdown {
    private readonly logger;
    onModuleInit(): void;
    onApplicationShutdown(signal?: string): void;
}
