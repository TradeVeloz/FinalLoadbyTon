import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';
import {
  login,
  authHeader,
  SHIPPER_EMAIL,
  CARRIER_EMAIL,
  validJobPayload,
} from './helpers';

describe('Job endpoints', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  it('lists seeded jobs', async () => {
    const res = await request(app).get('/api/v1/jobs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
  });

  it('filters jobs by status', async () => {
    const res = await request(app).get('/api/v1/jobs?status=IN_TRANSIT');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.every((j: { status: string }) => j.status === 'IN_TRANSIT')).toBe(true);
  });

  it('gets a single job by id', async () => {
    const res = await request(app).get('/api/v1/jobs/job-101');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('job-101');
    expect(res.body.jobCode).toBe('LBT-DXB-2608-4921');
  });

  it('looks up a job by its job code', async () => {
    const res = await request(app).get('/api/v1/jobs/LBT-DXB-2608-4921');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('job-101');
  });

  it('returns 404 for an unknown job', async () => {
    const res = await request(app).get('/api/v1/jobs/job-unknown');
    expect(res.status).toBe(404);
  });

  it('requires authentication to create a job', async () => {
    const res = await request(app).post('/api/v1/jobs').send(validJobPayload());
    expect(res.status).toBe(401);
  });

  it('forbids carriers from creating jobs', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .post('/api/v1/jobs')
      .set(authHeader(token))
      .send(validJobPayload());
    expect(res.status).toBe(403);
  });

  it('lets a shipper create a job as a draft', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/jobs')
      .set(authHeader(token))
      .send(validJobPayload({ containerNumber: 'MSKU5550001' }));
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.shipperId).toBe('usr-shipper-1');
    expect(res.body.jobCode).toMatch(/^LBT-/);
  });

  it('validates job payload (deadline before ready time)', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const payload = validJobPayload({
      readyTime: new Date(Date.now() + 3600000 * 24).toISOString(),
      deadline: new Date(Date.now() + 3600000 * 3).toISOString(),
    });
    const res = await request(app)
      .post('/api/v1/jobs')
      .set(authHeader(token))
      .send(payload);
    expect(res.status).toBe(422);
  });

  it('lets a shipper create, edit, and delete a draft job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const draftRes = await request(app)
      .post('/api/v1/jobs')
      .set(authHeader(token))
      .send(validJobPayload({ containerNumber: 'MSKU7770001' }));
    expect(draftRes.status).toBe(201);
    expect(draftRes.body.status).toBe('DRAFT');

    const editRes = await request(app)
      .put(`/api/v1/jobs/${draftRes.body.id}`)
      .set(authHeader(token))
      .send({ maxBudgetAED: 1750 });
    expect(editRes.status).toBe(200);
    expect(editRes.body.maxBudgetAED).toBe(1750);

    const delRes = await request(app)
      .delete(`/api/v1/jobs/${draftRes.body.id}`)
      .set(authHeader(token));
    expect(delRes.status).toBe(204);

    const gone = await request(app).get(`/api/v1/jobs/${draftRes.body.id}`);
    expect(gone.status).toBe(404);
  });

  it('lets a shipper submit a draft job for bidding', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/jobs/job-104/submit')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OPEN');
  });

  it('lets a shipper edit their open job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .put('/api/v1/jobs/job-104')
      .set(authHeader(token))
      .send({ maxBudgetAED: 1750 });
    expect(res.status).toBe(200);
    expect(res.body.maxBudgetAED).toBe(1750);
  });

  it('rejects submitting a non-draft job', async () => {
    const { token } = await login(app, SHIPPER_EMAIL);
    const res = await request(app)
      .post('/api/v1/jobs/job-101/submit')
      .set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('lets a carrier update a job status', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .post('/api/v1/jobs/job-103/status')
      .set(authHeader(token))
      .send({ status: 'IN_TRANSIT' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_TRANSIT');
  });

  it('rejects a carrier deleting a job', async () => {
    const { token } = await login(app, CARRIER_EMAIL);
    const res = await request(app)
      .delete('/api/v1/jobs/job-101')
      .set(authHeader(token));
    expect(res.status).toBe(403);
  });
});
