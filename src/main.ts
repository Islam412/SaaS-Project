import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable Validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // ==================== SWAGGER CONFIGURATION ====================
  const config = new DocumentBuilder()
    .setTitle('SaaS Subscription Management API')
    .setDescription(
      `
🚀 **SaaS Subscription Management System**

A complete multi-tenant subscription management platform with:
- **Multi-Tenant Architecture** - Complete data isolation between companies
- **JWT Authentication** - Secure API access
- **Subscription Management** - Plans, Customers, Subscriptions
- **Invoicing & Payments** - Automated billing and payment processing
- **Double-Entry Accounting** - Full financial tracking with deferred revenue
- **Financial Reports** - Balance Sheet & Income Statement

## 🔐 Authentication
All endpoints (except /auth/*) require a Bearer token.
Get your token from \`POST /auth/login\` or \`POST /auth/register\`.

## 🏢 Multi-Tenancy
Each tenant (company) has isolated data. Users can only access their own tenant's data.

## 📊 Accounting
The system uses double-entry bookkeeping with:
- Deferred Revenue (Liability)
- Accounts Receivable (Asset)
- Cash (Asset)
- Subscription Revenue (Revenue)

## 🔄 Revenue Recognition
Use \`POST /accounting/recognize-revenue\` to recognize deferred revenue at month-end.
      `,
    )
    .setVersion('1.0.0')
    .setContact('Your Name', 'https://github.com/your-username', 'your-email@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints (Register & Login)')
    .addTag('customers', 'Customer management endpoints')
    .addTag('plans', 'Subscription plan management endpoints')
    .addTag('subscriptions', 'Subscription management endpoints')
    .addTag('invoices', 'Invoice management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('accounting', 'Accounting & financial reporting endpoints')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://your-production-url.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI with custom options
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .info .title { color: #1a1a2e; }
      .swagger-ui .info .title small { font-size: 12px; }
    `,
    customSiteTitle: 'SaaS Subscription Management API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  });

  // ==================== START SERVER ====================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API Docs: http://localhost:${port}/api/docs`);
  console.log(`🗄️ Prisma Studio: http://localhost:5555`);
}
bootstrap();