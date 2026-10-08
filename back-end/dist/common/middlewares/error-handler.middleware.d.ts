import { NextFunction, Request, Response } from 'express';
export declare function errorHandlerMiddleware(err: Error & {
    status?: number;
    statusCode?: number;
    code?: string;
}, req: Request, res: Response, next: NextFunction): void;
