import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ContextualRequest } from './request-context.middleware.js';
export declare const STATIC_RATE_LIMIT: number;
export declare class StaticRateLimitMiddleware implements NestMiddleware {
    use(req: ContextualRequest, res: Response, next: NextFunction): void;
}
