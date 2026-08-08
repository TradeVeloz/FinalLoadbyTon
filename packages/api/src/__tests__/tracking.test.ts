import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';
import { login, authHeader, CARRIER_EMAIL } from './helpers';

describe('Tracking endpoints', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  it('returns tracking data for an in-transit job', async () => {
    const res = await request(app).get('/api/v1/tracking/job-102');
    expect(res.status).toBe(200);
    expect(res.body.jobId).toBe('job-102');
    expect(res.body.status).toBe('IN_TRANSIT');
    expect(res.body.currentLocation).toBeDefined();
    expect(res.body.milestones.length).toBeGreaterThan(0);
    expect(res.body.points.length).toBeGreaterThan(0);
  });

  it('returns 404 when no tracking data exists for a job', async () => {
    const res = await request(app).get('/api/v1/tracking/job-999');
    expect(res.status).toBe(404);
  });

  it('updates tracking for an existing job', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .put('/api/v1/tracking/job-102')
      .set(authHeader(token))
      .send({ lat: 25.12, lng: 55.21, speedKmH: 62, etaMinutes: 18 });
    expect(res.status).toBe(200);
    expect(res.body.currentLocation.lat).toBe(25.12);
    expect(res.body.currentLocation.lng).toBe(55.21);
    expect(res.body.speedKmH).toBe(62);
    expect(res.body.etaMinutes).toBe(18);
  });

  it('creates tracking for a job that had none', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .put('/api/v1/tracking/job-101')
      .set(authHeader(token))
      .send({ status: 'IN_TRANSIT', lat: 25.05, lng: 55.1 });
    expect(res.status).toBe(200);
    expect(res.body.jobId).toBe('job-101');
    expect(res.body.milestones.length).toBeGreaterThan(0);
    expect(res.body.points.length).toBeGreaterThan(0);
  });

  it('requires authentication to update tracking', async () => {
    const res = await request(app)
      .put('/api/v1/tracking/job-102')
      .send({ lat: 25.0, lng: 55.0 });
    expect(res.status).toBe(401);
  });
});
