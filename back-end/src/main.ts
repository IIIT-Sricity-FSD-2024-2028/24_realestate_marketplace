import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createServer, Server } from 'http';
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { API_RATE_LIMIT, AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AppLogger } from './common/logging/app-logger.service.js';
import { fileLogger } from './common/logging/file-logger.js';
import { errorHandlerMiddleware } from './common/middlewares/error-handler.middleware.js';
import { HttpLoggerMiddleware } from './common/middlewares/http-logger.middleware.js';
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware.js';
import {
  STATIC_RATE_LIMIT,
  StaticRateLimitMiddleware,
} from './common/middlewares/static-rate-limit.middleware.js';

const INSECURE_DEFAULT_JWT_SECRET = 'dev-only-insecure-secret-change-me';
// Keep the UI as an independently maintainable frontend while serving it from
// the Nest app exactly as before. `__dirname` is stable for both src/ and dist/.
const FRONTEND_DIR = join(__dirname, '..', '..', 'front-end');

async function bootstrap() {
  // Start the file logger before anything else can fail, so a crash during
  // bootstrap is still written to logs/error/*.log rather than only to stdout.
  fileLogger.start();
  installCrashHandlers();

  const logger = new Logger('Bootstrap');

  // ─── Fail fast on an insecure/missing production secret ───────────────────
  // A missing JWT_SECRET silently falls back to a string that's committed to
  // the repo (see config/configuration.ts) — anyone who has read the source
  // can forge valid tokens for any user, including admins. Refusing to boot
  // is safer than starting a real deployment wide open.
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === INSECURE_DEFAULT_JWT_SECRET)
  ) {
    logger.error(
      'Refusing to start: JWT_SECRET is unset (or still the insecure default) while NODE_ENV=production. ' +
        "Set a long random secret (e.g. `openssl rand -hex 32`) in the production environment's config.",
    );
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Replaces Nest's console logger with one that also writes every line to
    // logs/app/*.log — so framework, Mongoose and service logs are all persisted.
    logger: new AppLogger(),
    bufferLogs: true,
    // Keeps the untouched request bytes on `req.rawBody`. The payment-gateway
    // webhook is signed over the exact bytes sent, so verifying against a
    // re-serialised body would fail on any key-order or whitespace difference.
    rawBody: true,
  });

  // ─── Body parser limits ───────────────────────────────────────────────────
  // Nest's default JSON limit is 100kb, which would reject a large payload
  // *before* SecurityMiddleware's own check ever ran — and body-parser's error
  // is not an HttpException, so it surfaced as a confusing 500. Driving both
  // from MAX_JSON_BODY_KB keeps one number in charge of "how big is too big".
  const maxJsonBodyKb = Number(process.env.MAX_JSON_BODY_KB ?? 256);
  app.useBodyParser('json', { limit: `${maxJsonBodyKb}kb` });
  app.useBodyParser('urlencoded', { limit: `${maxJsonBodyKb}kb`, extended: true });

  // ─── Application-level middleware ─────────────────────────────────────────
  // Registered here rather than in AppModule.configure() because these must run
  // ahead of the static-asset handler below — every request that reaches the
  // process, including page loads, gets a correlation id and an HTTP log line.
  // (Router-level middleware — security/sanitization, auth + admin auditing,
  // upload validation — is bound to its route groups in AppModule.configure().)
  const requestContext = new RequestContextMiddleware();
  const httpLogger = new HttpLoggerMiddleware();
  const staticRateLimit = new StaticRateLimitMiddleware();
  app.use((req, res, next) => requestContext.use(req as never, res, next));
  app.use((req, res, next) => httpLogger.use(req as never, res, next));

  // ─── Security headers (CSP relaxed for the static frontend's inline <script>/<style>) ──
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ─── Rate limiting for static assets ──────────────────────────────────────
  // Must be registered BEFORE useStaticAssets: serve-static answers the request
  // and ends the response without ever entering the Nest router, so the global
  // ThrottlerGuard never sees /index.html, the dashboard css/js, or /uploads/*.
  app.use((req, res, next) => staticRateLimit.use(req as never, res, next));

  app.useStaticAssets(FRONTEND_DIR);
  // Uploaded property verification documents (see PropertiesController#uploadDocuments).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

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

  // ─── Global Prefix ────────────────────────────────────────────────────────
  // 'health' stays unprefixed so it's reachable at the bare `/health` path
  // container/PaaS platforms probe by convention.
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // ─── Graceful shutdown ─────────────────────────────────────────────────────
  // Lets Nest close the Mongoose connection cleanly on SIGTERM/SIGINT instead
  // of the process being killed mid-request — matters for zero-downtime
  // deploys/restarts on any container platform.
  app.enableShutdownHooks();

  // ─── Global Validation Pipe ───────────────────────────────────────────────
  // Strips unknown fields, transforms payloads to DTO class instances,
  // and rejects any request that fails validation rules.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw 400 if unknown fields sent
      transform: true,           // Auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Exception Filter ──────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Response Transformer ──────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Real Estate API')
    .setDescription(
      `## Real Estate Backend API\n\n` +
      `This API powers the real estate platform, supporting authentication, property listings, ` +
      `user management, and bookings, backed by MongoDB.\n\n` +
      `### Authentication & RBAC\n` +
      `Register via \`POST /auth/register\` or log in via \`POST /auth/login\` to receive a JWT. ` +
      `Send it as \`Authorization: Bearer <token>\` on protected endpoints (click **Authorize** below). ` +
      `Valid roles: \`admin\`, \`user\`, \`superuser\` (superuser automatically satisfies any admin-only route)\n\n` +
      `### Response Format\n` +
      `All responses follow the envelope: \`{ success, statusCode, message, data }\`\n\n` +
      `### Error Format\n` +
      `All errors follow: \`{ success: false, statusCode, message, errors? }\``
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the JWT returned by /auth/login or /auth/register',
      },
      'access-token',
    )
    .addTag('Auth', 'Registration, login, and the current-user profile')
    .addTag('Users', 'Admin-managed users, profiles, and role management')
    .addTag('Properties', 'Property CRUD — managed by admins')
    .addTag('Listings', 'Public listing search and filtering')
    .addTag('Bookings', 'Appointment and viewing bookings')
    .addTag('Logs', 'Read-only access to the http / error / app / audit log files')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // ─── Express error-handling middleware (last in the stack) ────────────────
  // init() builds the router; registering after it puts this middleware behind
  // every route, which is the only position Express will call it from. It catches
  // failures that happen outside Nest's pipeline, where the exception filter
  // above never runs (static assets, parser-level multipart errors).
  await app.init();
  app.getHttpAdapter().getInstance().use(errorHandlerMiddleware);

  const port = Number(process.env.PORT ?? 3000);
  const adminPort = Number(process.env.ADMIN_PORT ?? 3001);
  const superuserPort = Number(process.env.SUPERUSER_PORT ?? 3002);
  // Must match config/configuration.ts's default — main.ts reads env directly
  // here (bootstrap needs port/host before the app/DI container exists), so
  // the two defaults have to be kept in sync by hand.
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);

  // ─── Extra listeners for the admin/superuser portals ──────────────────────
  // Same Express instance, same routes, same API — this is NOT an access
  // boundary (every page/endpoint still works on every port); it just gives
  // the admin and superuser portals their own port number as requested.
  // enableShutdownHooks() above only tracks the primary app.listen() server,
  // so these extra listeners are closed by hand on SIGTERM/SIGINT below.
  const expressInstance = app.getHttpAdapter().getInstance();
  const extraServers: Server[] = [];
  for (const [label, extraPort] of [
    ['admin', adminPort],
    ['superuser', superuserPort],
  ] as const) {
    const server = createServer(expressInstance);
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(extraPort, host, resolve);
      });
      extraServers.push(server);
    } catch (err) {
      logger.error(
        `Could not start the ${label} portal on port ${extraPort} — ${
          err instanceof Error ? err.message : String(err)
        }. Set ${label === 'admin' ? 'ADMIN_PORT' : 'SUPERUSER_PORT'} to a free port and restart.`,
      );
    }
  }
  const closeExtraServers = () => extraServers.forEach((s) => s.close());
  process.on('SIGTERM', closeExtraServers);
  process.on('SIGINT', closeExtraServers);

  // 0.0.0.0 means "listen on every interface", not a browsable address —
  // swap it for localhost when printing links a person will actually click.
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  const urlFor = (p: number) => `http://${displayHost}:${p}`;
  const baseUrl = urlFor(port);

  logger.log(`🚀 Application running on: ${baseUrl}/api/v1`);
  logger.log(`📚 Swagger docs available at: ${baseUrl}/api/docs`);
  // Printed so "is the running process actually the build I just made?" is
  // answerable at a glance — a stale node process holding the port is otherwise
  // indistinguishable from a limiter that isn't working.
  logger.log(
    `🚦 Rate limits: API ${API_RATE_LIMIT}/min (/api/v1/*), static ${STATIC_RATE_LIMIT}/min (front-end/, uploads/), /health exempt`,
  );

  // ─── Frontend entry points, per role — each on its own port ──────────────
  console.log('');
  console.log('🔗 App URLs:');
  console.log(`   👤 Buyer / Seller Login : ${baseUrl}/index.html`);
  console.log(`   🛡️  Admin Login          : ${urlFor(adminPort)}/admin-login.html`);
  console.log(`   👑 Superuser Login       : ${urlFor(superuserPort)}/superuser-login.html`);
  console.log('');
  console.log(`📝 Logs are written to: ${fileLogger.getLogDir()}`);
  console.log('   http/ · error/ · app/ · audit/  (rotated daily, flushed every few seconds)');
  console.log('');
}

/**
 * Last line of defence: an exception nobody caught, or a rejected promise nobody
 * handled, kills the process. Write the reason to logs/error and flush before the
 * process goes away — otherwise the one log line that explains a crash is exactly
 * the one that never reaches disk.
 */
function installCrashHandlers(): void {
  process.on('uncaughtException', (error) => {
    fileLogger.write('error', 'fatal', `Uncaught exception: ${error.message}`, {
      errorName: error.name,
      stack: error.stack,
      source: 'process.uncaughtException',
    });
    fileLogger.flush();
    // The process is in an undefined state after an uncaught throw; exiting lets
    // the supervisor (PM2/Docker/systemd) restart it cleanly.
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    fileLogger.write('error', 'error', 'Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      source: 'process.unhandledRejection',
    });
    fileLogger.flush();
  });

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      fileLogger.app('info', `Received ${signal} — flushing logs before exit`);
      fileLogger.stop();
    });
  }
}

bootstrap();
