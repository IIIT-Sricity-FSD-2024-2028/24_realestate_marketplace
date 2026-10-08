import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ContextualRequest } from './request-context.middleware.js';
export declare class SecurityMiddleware implements NestMiddleware {
    use(req: ContextualRequest, res: Response, next: NextFunction): void;
}
