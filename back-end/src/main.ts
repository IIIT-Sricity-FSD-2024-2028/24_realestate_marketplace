import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(json({ limit: '30mb' }));
  app.use(urlencoded({ extended: true, limit: '30mb' }));

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'role'],
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

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
      `This API powers the real estate platform, supporting property listings, user management, and bookings.\n\n` +
      `### Authentication & RBAC\n` +
      `All protected endpoints require a \`role\` header indicating the caller's role.\n` +
      `Valid roles: \`superuser\`, \`admin\`, \`agent\`, \`seller\`, \`buyer\`\n\n` +
      `### Response Format\n` +
      `All responses follow the envelope: \`{ success, statusCode, message, data }\`\n\n` +
      `### Error Format\n` +
      `All errors follow: \`{ success: false, statusCode, message, errors? }\``
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'role',
        description: 'User role for RBAC (superuser | admin | agent | seller | buyer)',
      },
      'role-header',
    )
    .addTag('Users', 'User registration, profiles, and role management')
    .addTag('Properties', 'Property CRUD — managed by agents and admins')
    .addTag('Listings', 'Public listing search and filtering')
    .addTag('Bookings', 'Appointment and viewing bookings')
    .addTag('Agents', 'Agent profile and operations')
    .addTag('Sellers', 'Seller profile and property ownership')
    .addTag('Buyers', 'Buyer profile and preferences')
    .addTag('Visits', 'Property visit scheduling and tracking')
    .addTag('Shortlists', 'Buyer shortlisted properties')
    .addTag('Negotiations', 'Offer and counter-offer tracking')
    .addTag('Payments', 'Payment and transaction records')
    .addTag('Purchases', 'Completed purchase records')
    .addTag('Notifications', 'User notifications')
    .addTag('Reports', 'Admin reports')
    .addTag('PropertyImages', 'Property image records')
    .addTag('PropertyDocuments', 'Property document records')
    .addTag('BankAccounts', 'Bank account records')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
