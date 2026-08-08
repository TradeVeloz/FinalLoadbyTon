import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';
import { login, authHeader, SHIPPER_EMAIL } from './helpers';

describe('Auth endpoints', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  it('registers a new carrier account', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'newcarrier@example.ae',
      password: 'strongpass123',
      role: 'CARRIER',
      companyName: 'Desert Line Transport',
      trnNumber: 'TRN-999888777000001',
      phone: '+971 52 111 2233',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newcarrier@example.ae');
    expect(res.body.user.role).toBe('CARRIER');
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects registering with an existing email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: SHIPPER_EMAIL,
      password: 'strongpass123',
      role: 'SHIPPER',
      companyName: 'Duplicate Co',
    });
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials and returns a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: SHIPPER_EMAIL, password: 'demo1234' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('SHIPPER');
  });

  it('rejects login with a wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: SHIPPER_EMAIL, password: 'wrongpass123' });
    expect(res.status).toBe(401);
  });

  it('rejects login for an unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.ae', password: 'whatever123' });
    expect(res.status).toBe(401);
  });

  it('refreshes an access token with a valid refresh token', async () => {
    const { refreshToken } = await login(app, SHIPPER_EMAIL);
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not-a-valid-token' });
    expect(res.status).toBe(401);
  });

  it('logs out an authenticated user', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects protected routes without a token', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(401);
  });

  it('sets up MFA for an authenticated user', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/auth/mfa/setup')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.secret).toBeDefined();
    expect(res.body.qrCodeUrl).toContain('otpauth://totp/');
  });

  it('forgot-password responds gracefully for unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'ghost@example.ae' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('reset link');
  });
});
