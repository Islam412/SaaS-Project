import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

const request = require('supertest');

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testEmail = `e2e-${Date.now()}@company.com`;
  const testPassword = 'Password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / should return Hello World', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200);
    expect(response.text).toBe('Hello World!');
  });

  it('POST /auth/register should register a new tenant', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'E2E Test Company',
        email: testEmail,
        password: testPassword,
        phone: '+1234567890',
        address: '123 Test St',
      })
      .expect(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.email).toBe(testEmail);
  });

  it('POST /auth/login should login successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.email).toBe(testEmail);
  });

  it('POST /customers should create a customer', async () => {
    // Login first to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Customer',
        email: 'e2e@customer.com',
        phone: '+987654321',
        address: '456 Test Ave',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('e2e@customer.com');
  });

  it('POST /plans should create a subscription plan', async () => {
    // Login first to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .post('/plans')
      .set('Authorization', `Bearer ${token}`)
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
  });

  it('GET /customers should get all customers', async () => {
    // Login first to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /plans should get all plans', async () => {
    // Login first to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .get('/plans')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /subscriptions should create a subscription', async () => {
    // Login first to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.access_token;

    // Get customer ID
    const customersResponse = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);

    const customerId = customersResponse.body[0]?.id;

    // Get plan ID
    const plansResponse = await request(app.getHttpServer())
      .get('/plans')
      .set('Authorization', `Bearer ${token}`);

    const planId = plansResponse.body[0]?.id;

    if (customerId && planId) {
      const response = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId,
          planId,
          startDate: '2026-06-27T00:00:00Z',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('ACTIVE');
    }
  });
});