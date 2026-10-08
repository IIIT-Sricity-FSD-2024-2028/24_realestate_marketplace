import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ContextualRequest } from './request-context.middleware.js';
export declare class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly logStaticAssets;
    use(req: ContextualRequest, res: Response, next: NextFunction): void;
}
export declare function clientIp(req: ContextualRequest): string;
export declare function describeUser(req: ContextualRequest): Record<string, unknown> | undefined;
