"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const http_1 = require("http");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
const transform_interceptor_js_1 = require("./common/interceptors/transform.interceptor.js");
const app_logger_service_js_1 = require("./common/logging/app-logger.service.js");
const file_logger_js_1 = require("./common/logging/file-logger.js");
const error_handler_middleware_js_1 = require("./common/middlewares/error-handler.middleware.js");
const http_logger_middleware_js_1 = require("./common/middlewares/http-logger.middleware.js");
const request_context_middleware_js_1 = require("./common/middlewares/request-context.middleware.js");
const static_rate_limit_middleware_js_1 = require("./common/middlewares/static-rate-limit.middleware.js");
const INSECURE_DEFAULT_JWT_SECRET = 'dev-only-insecure-secret-change-me';
const FRONTEND_DIR = (0, path_1.join)(__dirname, '..', '..', 'front-end');
async function bootstrap() {
    file_logger_js_1.fileLogger.start();
    installCrashHandlers();
    const logger = new common_1.Logger('Bootstrap');
    if (process.env.NODE_ENV === 'production' &&
        (!process.env.JWT_SECRET || process.env.JWT_SECRET === INSECURE_DEFAULT_JWT_SECRET)) {
        logger.error('Refusing to start: JWT_SECRET is unset (or still the insecure default) while NODE_ENV=production. ' +
            "Set a long random secret (e.g. `openssl rand -hex 32`) in the production environment's config.");
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule, {
        logger: new app_logger_service_js_1.AppLogger(),
        bufferLogs: true,
        rawBody: true,
    });
    const maxJsonBodyKb = Number(process.env.MAX_JSON_BODY_KB ?? 256);
    app.useBodyParser('json', { limit: `${maxJsonBodyKb}kb` });
    app.useBodyParser('urlencoded', { limit: `${maxJsonBodyKb}kb`, extended: true });
    const requestContext = new request_context_middleware_js_1.RequestContextMiddleware();
    const httpLogger = new http_logger_middleware_js_1.HttpLoggerMiddleware();
    const staticRateLimit = new static_rate_limit_middleware_js_1.StaticRateLimitMiddleware();
    app.use((req, res, next) => requestContext.use(req, res, next));
    app.use((req, res, next) => httpLogger.use(req, res, next));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.use((req, res, next) => staticRateLimit.use(req, res, next));
    app.useStaticAssets(FRONTEND_DIR);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    const corsOrigins = (process.env.CORS_ORIGINS ?? [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3002',
        'http://localhost:3003',
        'http://127.0.0.1:3003',
        'http://localhost:3004',
        'http://127.0.0.1:3004',
    ].join(','))
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins,
    });
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.enableShutdownHooks();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_js_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Real Estate API')
        .setDescription(`## Real Estate Backend API\n\n` +
        `This API powers the real estate platform, supporting authentication, property listings, ` +
        `user management, and bookings, backed by MongoDB.\n\n` +
        `### Authentication & RBAC\n` +
        `Register via \`POST /auth/register\` or log in via \`POST /auth/login\` to receive a JWT. ` +
        `Send it as \`Authorization: Bearer <token>\` on protected endpoints (click **Authorize** below). ` +
        `Valid roles: \`admin\`, \`user\`, \`superuser\` (superuser automatically satisfies any admin-only route)\n\n` +
        `### Response Format\n` +
        `All responses follow the envelope: \`{ success, statusCode, message, data }\`\n\n` +
        `### Error Format\n` +
        `All errors follow: \`{ success: false, statusCode, message, errors? }\``)
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the JWT returned by /auth/login or /auth/register',
    }, 'access-token')
        .addTag('Auth', 'Registration, login, and the current-user profile')
        .addTag('Users', 'Admin-managed users, profiles, and role management')
        .addTag('Properties', 'Property CRUD — managed by admins')
        .addTag('Listings', 'Public listing search and filtering')
        .addTag('Bookings', 'Appointment and viewing bookings')
        .addTag('Logs', 'Read-only access to the http / error / app / audit log files')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    await app.init();
    app.getHttpAdapter().getInstance().use(error_handler_middleware_js_1.errorHandlerMiddleware);
    const port = Number(process.env.PORT ?? 3000);
    const adminPort = Number(process.env.ADMIN_PORT ?? 3001);
    const superuserPort = Number(process.env.SUPERUSER_PORT ?? 3002);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);
    const expressInstance = app.getHttpAdapter().getInstance();
    const extraServers = [];
    for (const [label, extraPort] of [
        ['admin', adminPort],
        ['superuser', superuserPort],
    ]) {
        const server = (0, http_1.createServer)(expressInstance);
        try {
            await new Promise((resolve, reject) => {
                server.once('error', reject);
                server.listen(extraPort, host, resolve);
            });
            extraServers.push(server);
        }
        catch (err) {
            logger.error(`Could not start the ${label} portal on port ${extraPort} — ${err instanceof Error ? err.message : String(err)}. Set ${label === 'admin' ? 'ADMIN_PORT' : 'SUPERUSER_PORT'} to a free port and restart.`);
        }
    }
    const closeExtraServers = () => extraServers.forEach((s) => s.close());
    process.on('SIGTERM', closeExtraServers);
    process.on('SIGINT', closeExtraServers);
    const displayHost = host === '0.0.0.0' ? 'localhost' : host;
    const urlFor = (p) => `http://${displayHost}:${p}`;
    const baseUrl = urlFor(port);
    logger.log(`🚀 Application running on: ${baseUrl}/api/v1`);
    logger.log(`📚 Swagger docs available at: ${baseUrl}/api/docs`);
    logger.log(`🚦 Rate limits: API ${app_module_js_1.API_RATE_LIMIT}/min (/api/v1/*), static ${static_rate_limit_middleware_js_1.STATIC_RATE_LIMIT}/min (front-end/, uploads/), /health exempt`);
    console.log('');
    console.log('🔗 App URLs:');
    console.log(`   👤 Buyer / Seller Login : ${baseUrl}/index.html`);
    console.log(`   🛡️  Admin Login          : ${urlFor(adminPort)}/admin-login.html`);
    console.log(`   👑 Superuser Login       : ${urlFor(superuserPort)}/superuser-login.html`);
    console.log('');
    console.log(`📝 Logs are written to: ${file_logger_js_1.fileLogger.getLogDir()}`);
    console.log('   http/ · error/ · app/ · audit/  (rotated daily, flushed every few seconds)');
    console.log('');
}
function installCrashHandlers() {
    process.on('uncaughtException', (error) => {
        file_logger_js_1.fileLogger.write('error', 'fatal', `Uncaught exception: ${error.message}`, {
            errorName: error.name,
            stack: error.stack,
            source: 'process.uncaughtException',
        });
        file_logger_js_1.fileLogger.flush();
        process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
        file_logger_js_1.fileLogger.write('error', 'error', 'Unhandled promise rejection', {
            reason: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? reason.stack : undefined,
            source: 'process.unhandledRejection',
        });
        file_logger_js_1.fileLogger.flush();
    });
    for (const signal of ['SIGTERM', 'SIGINT']) {
        process.on(signal, () => {
            file_logger_js_1.fileLogger.app('info', `Received ${signal} — flushing logs before exit`);
            file_logger_js_1.fileLogger.stop();
        });
    }
}
bootstrap();
//# sourceMappingURL=main.js.map