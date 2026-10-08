import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service.js';
import { istTimestamp } from './shared/helpers/ist-time.helper.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Excluded from the `api/v1` prefix in main.ts (setGlobalPrefix's `exclude`)
  // so it's reachable at the conventional bare `/health` path that most
  // container/PaaS liveness & readiness probes expect out of the box.
  @Get('health')
  @SkipThrottle()
  getHealth() {
    // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const dbConnected = this.mongoConnection.readyState === ConnectionStates.connected;
    return {
      status: dbConnected ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: istTimestamp(),
      database: dbConnected ? 'connected' : 'disconnected',
    };
  }
}
