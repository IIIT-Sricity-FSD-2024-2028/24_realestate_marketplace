"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = exports.API_RATE_LIMIT_TTL_MS = exports.API_RATE_LIMIT = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
exports.API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT ?? 100);
exports.API_RATE_LIMIT_TTL_MS = Number(process.env.API_RATE_LIMIT_TTL_MS ?? 60_000);
const admins_controller_js_1 = require("./modules/admins/admins.controller.js");
const admins_module_js_1 = require("./modules/admins/admins.module.js");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
const bank_accounts_module_js_1 = require("./modules/bank-accounts/bank-accounts.module.js");
const billing_module_js_1 = require("./modules/billing/billing.module.js");
const commissions_module_js_1 = require("./modules/commissions/commissions.module.js");
const bookings_module_js_1 = require("./modules/bookings/bookings.module.js");
const buyers_module_js_1 = require("./modules/buyers/buyers.module.js");
const configuration_js_1 = __importDefault(require("./config/configuration.js"));
const listings_module_js_1 = require("./modules/listings/listings.module.js");
const logs_module_js_1 = require("./modules/logs/logs.module.js");
const logging_module_js_1 = require("./common/logging/logging.module.js");
const negotiations_module_js_1 = require("./modules/negotiations/negotiations.module.js");
const notifications_module_js_1 = require("./modules/notifications/notifications.module.js");
const payments_module_js_1 = require("./modules/payments/payments.module.js");
const properties_module_js_1 = require("./modules/properties/properties.module.js");
const property_documents_module_js_1 = require("./modules/property-documents/property-documents.module.js");
const property_images_module_js_1 = require("./modules/property-images/property-images.module.js");
const purchases_module_js_1 = require("./modules/purchases/purchases.module.js");
const reports_module_js_1 = require("./modules/reports/reports.module.js");
const sellers_module_js_1 = require("./modules/sellers/sellers.module.js");
const shortlists_module_js_1 = require("./modules/shortlists/shortlists.module.js");
const subscriptions_module_js_1 = require("./modules/subscriptions/subscriptions.module.js");
const users_module_js_1 = require("./modules/users/users.module.js");
const visits_module_js_1 = require("./modules/visits/visits.module.js");
const auth_controller_js_1 = require("./modules/auth/auth.controller.js");
const bank_accounts_controller_js_1 = require("./modules/bank-accounts/bank-accounts.controller.js");
const billing_controller_js_1 = require("./modules/billing/billing.controller.js");
const payments_controller_js_1 = require("./modules/payments/payments.controller.js");
const properties_controller_js_1 = require("./modules/properties/properties.controller.js");
const purchases_controller_js_1 = require("./modules/purchases/purchases.controller.js");
const users_controller_js_1 = require("./modules/users/users.controller.js");
const admin_audit_middleware_js_1 = require("./common/middlewares/admin-audit.middleware.js");
const auth_audit_middleware_js_1 = require("./common/middlewares/auth-audit.middleware.js");
const security_middleware_js_1 = require("./common/middlewares/security.middleware.js");
const upload_validation_middleware_js_1 = require("./common/middlewares/upload-validation.middleware.js");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(security_middleware_js_1.SecurityMiddleware)
            .forRoutes({ path: '*splat', method: common_1.RequestMethod.ALL });
        consumer.apply(auth_audit_middleware_js_1.AuthAuditMiddleware).forRoutes(auth_controller_js_1.AuthController);
        consumer
            .apply(admin_audit_middleware_js_1.AdminAuditMiddleware)
            .forRoutes(admins_controller_js_1.AdminsController, users_controller_js_1.UsersController, properties_controller_js_1.PropertiesController, purchases_controller_js_1.PurchasesController, payments_controller_js_1.PaymentsController, billing_controller_js_1.BillingController, bank_accounts_controller_js_1.BankAccountsController);
        consumer
            .apply(upload_validation_middleware_js_1.UploadValidationMiddleware)
            .forRoutes({ path: 'properties/:id/documents', method: common_1.RequestMethod.POST }, { path: 'properties/:id/images', method: common_1.RequestMethod.POST });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_js_1.default],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('mongodbUri'),
                }),
            }),
            logging_module_js_1.LoggingModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: exports.API_RATE_LIMIT_TTL_MS,
                    limit: exports.API_RATE_LIMIT,
                },
            ]),
            auth_module_js_1.AuthModule,
            admins_module_js_1.AdminsModule,
            bank_accounts_module_js_1.BankAccountsModule,
            billing_module_js_1.BillingModule,
            commissions_module_js_1.CommissionsModule,
            subscriptions_module_js_1.SubscriptionsModule,
            bookings_module_js_1.BookingsModule,
            buyers_module_js_1.BuyersModule,
            listings_module_js_1.ListingsModule,
            logs_module_js_1.LogsModule,
            negotiations_module_js_1.NegotiationsModule,
            notifications_module_js_1.NotificationsModule,
            payments_module_js_1.PaymentsModule,
            properties_module_js_1.PropertiesModule,
            property_documents_module_js_1.PropertyDocumentsModule,
            property_images_module_js_1.PropertyImagesModule,
            purchases_module_js_1.PurchasesModule,
            reports_module_js_1.ReportsModule,
            sellers_module_js_1.SellersModule,
            shortlists_module_js_1.ShortlistsModule,
            users_module_js_1.UsersModule,
            visits_module_js_1.VisitsModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [
            app_service_js_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map