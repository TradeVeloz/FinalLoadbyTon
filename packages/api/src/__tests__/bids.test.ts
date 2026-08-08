import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';
import { login, authHeader, SHIPPER_EMAIL, CARRIER_EMAIL } from './helpers';

describe('Bid endpoints', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  const carrierBidPayload = (overrides: Record<string, unknown> = {}) => ({
    amountAED: 1150,
    etaMinutes: 40,
    truckType: 'Container Chassis Skeletal',
    driverName: 'Test Driver',
    notes: 'Automated test bid',
    ...overrides,
  });

  it('lists bids for a job', async () => {
    const res = await request(app).get('/api/v1/bids/job/job-101');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });

  it('gets a single bid by id', async () => {
    const res = await request(app).get('/api/v1/bids/bid-301');
    expect(res.status).toBe(200);
    expect(res.body.jobId).toBe('job-101');
    expect(res.body.amountAED).toBe(1180);
  });

  it('returns 404 for an unknown bid', async () => {
    const res = await request(app).get('/api/v1/bids/bid-unknown');
    expect(res.status).toBe(404);
  });

  it('lets a carrier place a bid on an open job', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .post('/api/v1/bids/job/job-101')
      .set(authHeader(token))
      .send(carrierBidPayload());
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.jobId).toBe('job-101');
    expect(res.body.carrierName).toBe('Emirates Overland Haulage Co.');
  });

  it('lets a carrier update their pending bid', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const created = await request(app)
      .post('/api/v1/bids/job/job-101')
      .set(authHeader(token))
      .send(carrierBidPayload({ amountAED: 1110 }));
    expect(created.status).toBe(201);

    const res = await request(app)
      .put(`/api/v1/bids/${created.body.id}`)
      .set(authHeader(token))
      .send({ amountAED: 1090 });
    expect(res.status).toBe(200);
    expect(res.body.amountAED).toBe(1090);
  });

  it('forbids shippers from placing bids', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/bids/job/job-101')
      .set(authHeader(token))
      .send(carrierBidPayload());
    expect(res.status).toBe(403);
  });

  it('rejects bids on jobs no longer accepting bids', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .post('/api/v1/bids/job/job-102')
      .set(authHeader(token))
      .send(carrierBidPayload());
    expect(res.status).toBe(400);
  });

  it('lets a shipper accept a bid and awards the job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/bids/bid-301/accept')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.bid.status).toBe('ACCEPTED');
    expect(res.body.job.status).toBe('AWARDED');
    expect(res.body.job.carrierId).toBe('usr-carrier-1');
    expect(res.body.job.agreedPriceAED).toBe(1180);

    const job = await request(app).get('/api/v1/jobs/job-101');
    expect(job.body.status).toBe('AWARDED');
  });

  it('lets a shipper reject a bid', async () => {
    const carrier = await login(app, CARRIER_EMAIL);
    const placed = await request(app)
      .post('/api/v1/bids/job/job-103')
      .set(authHeader(carrier.token))
      .send(carrierBidPayload({ amountAED: 1600 }));
    expect(placed.status).toBe(201);

    const shipper = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post(`/api/v1/bids/${placed.body.id}/reject`)
      .set(authHeader(shipper.token));
    expect(res.status).toBe(200);
    expect(res.body.bid.status).toBe('REJECTED');
  });
});
