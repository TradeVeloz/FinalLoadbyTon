import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';
import { login, authHeader, SHIPPER_EMAIL } from './helpers';

describe('Payment (escrow) endpoints', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  it('requires authentication for escrow creation', async () => {
    const res = await request(app)
      .post('/api/v1/payments/escrow')
      .send({ jobId: 'job-103', amountAED: 1650 });
    expect(res.status).toBe(401);
  });

  it('creates an escrow payment for a job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/payments/escrow')
      .set(authHeader(token))
      .send({ jobId: 'job-103', amountAED: 1650 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ESCROW');
    expect(res.body.jobId).toBe('job-103');
    expect(res.body.amountAED).toBe(1650);
    expect(res.body.platformFeeAED).toBeGreaterThan(0);
    expect(res.body.transactionRef).toMatch(/^TXN-/);
  });

  it('rejects a duplicate escrow for the same job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/payments/escrow')
      .set(authHeader(token))
      .send({ jobId: 'job-103', amountAED: 1650 });
    expect(res.status).toBe(409);
  });

  it('returns 404 when escrowing a missing job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/payments/escrow')
      .set(authHeader(token))
      .send({ jobId: 'job-missing', amountAED: 1000 });
    expect(res.status).toBe(404);
  });

  it('lists payment history', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .get('/api/v1/payments/history')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('gets a payment by id', async () => {
    const res = await request(app).get('/api/v1/payments/pay-701');
    expect(res.status).toBe(200);
    expect(res.body.jobId).toBe('job-102');
  });

  it('returns 404 for an unknown payment', async () => {
    const res = await request(app).get('/api/v1/payments/pay-missing');
    expect(res.status).toBe(404);
  });

  it('releases an escrow payment to the carrier', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/payments/pay-701/release')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe('RELEASED');
  });

  it('flags a payment for dispute', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const created = await request(app)
      .post('/api/v1/payments/escrow')
      .set(authHeader(token))
      .send({ jobId: 'job-101', amountAED: 1180 });
    expect(created.status).toBe(201);

    const res = await request(app)
      .post(`/api/v1/payments/${created.body.id}/dispute`)
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe('DISPUTED');
  });
});
