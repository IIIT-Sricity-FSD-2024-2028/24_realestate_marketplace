import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

/**
 * Requests per IP per window allowed on `/api/v1/*`. Exported so bootstrap can
 * print it in the startup banner; `AuthController` tightens it further per-route.
 * Static files (public/, uploads/) never reach a guard and are limited separately
 * by StaticRateLimitMiddleware.
 */
export const API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT ?? 100);
export const API_RATE_LIMIT_TTL_MS = Number(process.env.API_RATE_LIMIT_TTL_MS ?? 60_000);
import { AdminsController } from './modules/admins/admins.controller.js';
import { AdminsModule } from './modules/admins/admins.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { CommissionsModule } from './modules/commissions/commissions.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { BuyersModule } from './modules/buyers/buyers.module.js';
import configuration from './config/configuration.js';
import { ListingsModule } from './modules/listings/listings.module.js';
import { LogsModule } from './modules/logs/logs.module.js';
import { LoggingModule } from './common/logging/logging.module.js';
import { NegotiationsModule } from './modules/negotiations/negotiations.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { PropertiesModule } from './modules/properties/properties.module.js';
import { PropertyDocumentsModule } from './modules/property-documents/property-documents.module.js';
import { PropertyImagesModule } from './modules/property-images/property-images.module.js';
import { PurchasesModule } from './modules/purchases/purchases.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { SellersModule } from './modules/sellers/sellers.module.js';
import { ShortlistsModule } from './modules/shortlists/shortlists.module.js';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VisitsModule } from './modules/visits/visits.module.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { BankAccountsController } from './modules/bank-accounts/bank-accounts.controller.js';
import { BillingController } from './modules/billing/billing.controller.js';
import { PaymentsController } from './modules/payments/payments.controller.js';
import { PropertiesController } from './modules/properties/properties.controller.js';
import { PurchasesController } from './modules/purchases/purchases.controller.js';
import { UsersController } from './modules/users/users.controller.js';
import { AdminAuditMiddleware } from './common/middlewares/admin-audit.middleware.js';
import { AuthAuditMiddleware } from './common/middlewares/auth-audit.middleware.js';
import { SecurityMiddleware } from './common/middlewares/security.middleware.js';
import { UploadValidationMiddleware } from './common/middlewares/upload-validation.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
      }),
    }),
    // File-based logging (http / error / app / audit channels). Global, so any
    // provider can inject FILE_LOGGER; also owns the flush timer's lifecycle.
    LoggingModule,
    // Global rate limiting — protects auth endpoints (and everything else) from
    // brute-force / credential-stuffing and basic abuse. AuthController tightens
    // this further on register/login specifically via @Throttle(...).
    ThrottlerModule.forRoot([
      {
        ttl: API_RATE_LIMIT_TTL_MS,
        limit: API_RATE_LIMIT,
      },
    ]),
    AuthModule,
    AdminsModule,
    BankAccountsModule,
    // ─── Revenue model ──────────────────────────────────────────────────
    // BillingModule is the orchestrator (rate card, checkout, revenue
    // report); the other three own one revenue stream each.
    BillingModule,
    CommissionsModule,
    SubscriptionsModule,
    BookingsModule,
    BuyersModule,
    ListingsModule,
    LogsModule,
    NegotiationsModule,
    NotificationsModule,
    PaymentsModule,
    PropertiesModule,
    PropertyDocumentsModule,
    PropertyImagesModule,
    PurchasesModule,
    ReportsModule,
    SellersModule,
    ShortlistsModule,
    UsersModule,
    VisitsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  /**
   * Router-level middleware.
   *
   * These are bound to specific route groups rather than to the whole app — the
   * three application-level ones (request context, HTTP logging, helmet) are
   * registered in main.ts, because they have to run ahead of the static-asset
   * handler too.
   *
   * Order matters: within `configure()`, middleware runs in the order it is
   * applied here, and always after Nest's body parser (which is why the security
   * middleware can inspect `req.body`) but before guards, interceptors and the
   * route handler.
   */
  configure(consumer: MiddlewareConsumer): void {
    // ─── Security: sanitize every incoming payload, on every route ───────────
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*splat', method: RequestMethod.ALL });

    // ─── Audit: credential handling ─────────────────────────────────────────
    consumer.apply(AuthAuditMiddleware).forRoutes(AuthController);

    // ─── Audit: privileged writes (who changed what) ─────────────────────────
    consumer
      .apply(AdminAuditMiddleware)
      .forRoutes(
        AdminsController,
        UsersController,
        PropertiesController,
        PurchasesController,
        PaymentsController,
        BillingController,
        BankAccountsController,
      );

    // ─── File upload: reject bad multipart requests before multer parses ─────
    // Paths here are relative to the global prefix — Nest prepends `api/v1`
    // itself (RouteInfoPathExtractor), so writing it out would double it.
    consumer
      .apply(UploadValidationMiddleware)
      .forRoutes(
        { path: 'properties/:id/documents', method: RequestMethod.POST },
        { path: 'properties/:id/images', method: RequestMethod.POST },
      );
  }
}
