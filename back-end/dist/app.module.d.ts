import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export declare const API_RATE_LIMIT: number;
export declare const API_RATE_LIMIT_TTL_MS: number;
export declare class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
