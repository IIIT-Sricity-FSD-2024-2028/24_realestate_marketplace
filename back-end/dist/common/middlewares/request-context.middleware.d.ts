import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
export interface RequestContext {
    requestId?: string;
    startedAt?: bigint;
}
export type ContextualRequest = Request & RequestContext & {
    user?: {
        userId?: string;
        id?: string;
        email?: string;
        role?: string;
    };
};
export declare class RequestContextMiddleware implements NestMiddleware {
    use(req: ContextualRequest, res: Response, next: NextFunction): void;
}
export declare function elapsedMs(req: ContextualRequest): number;
