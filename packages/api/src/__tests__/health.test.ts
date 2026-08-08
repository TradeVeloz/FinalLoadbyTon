import { Express } from 'express';
import request from 'supertest';
import { createServer } from '../server';

describe('Server health & base routing', () => {
  let app: Express;

  beforeAll(() => {
    ({ app } = createServer());
  });

  it('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('loadbyton-api');
  });

  it('GET /health includes a timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
