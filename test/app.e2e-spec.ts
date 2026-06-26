import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let tenantId: string;
  let customerId: string;
  let planId: string;
  let subscriptionId: string;
  let invoiceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Auth Flow', () => {
    it('should register a new tenant', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'E2E Test Company',
          email: 'e2e@company.com',
          password: 'password123',
          phone: '+1234567890',
          address: '123 Test St',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('e2e@company.com');

      accessToken = response.body.access_token;
      tenantId = response.body.user.tenantId;
    });

    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e@company.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });
  });

  describe('Customer Management', () => {
    it('should create a customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'E2E Customer',
          email: 'e2e@customer.com',
          phone: '+987654321',
          address: '456 Test Ave',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('e2e@customer.com');
      customerId = response.body.id;
    });

    it('should get all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Plan Management', () => {
    it('should create a subscription plan', async () => {
      const response = await request(app.getHttpServer())
        .post('/plans')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'E2E Test Plan',
          description: 'Test plan for E2E tests',
          price: 100,
          currency: 'USD',
          billingCycle: 'MONTHLY',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Plan');
      planId = response.body.id;
    });

    it('should get all plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/plans')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Subscription Management', () => {
    it('should create a subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          planId,
          startDate: new Date().toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.planId).toBe(planId);
      subscriptionId = response.body.id;
    });

    it('should get active subscriptions', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscriptions/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Invoice and Payment Flow', () => {
    it('should create an invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          subscriptionId,
          amount: 100,
          tax: 0,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('invoiceNumber');
      expect(response.body.amount).toBe('100');
      invoiceId = response.body.id;
    });

    it('should generate monthly invoices', async () => {
      const response = await request(app.getHttpServer())
        .post('/invoices/generate-monthly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('results');
    });

    it('should process a payment', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          invoiceId,
          amount: 100,
          method: 'CASH',
          reference: 'PAY-E2E-001',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe('100');
      expect(response.body.status).toBe('COMPLETED');
    });
  });

  describe('Accounting Reports', () => {
    it('should get journal entries', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounting/journal-entries')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get balance sheet', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounting/balance-sheet')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('assets');
      expect(response.body).toHaveProperty('liabilities');
      expect(response.body).toHaveProperty('revenue');
    });

    it('should get income statement', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounting/income-statement')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('revenue');
      expect(response.body).toHaveProperty('expenses');
      expect(response.body).toHaveProperty('netIncome');
    });

    it('should recognize revenue', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounting/recognize-revenue')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('recognizedAmount');
    });
  });
});
