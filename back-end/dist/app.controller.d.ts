import { Connection } from 'mongoose';
import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    private readonly mongoConnection;
    constructor(appService: AppService, mongoConnection: Connection);
    getHello(): string;
    getHealth(): {
        status: string;
        uptime: number;
        timestamp: string;
        database: string;
    };
}
