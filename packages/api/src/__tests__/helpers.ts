import { Express } from 'express';
import request from 'supertest';

export interface AuthSession {
  token: string;
  refreshToken: string;
  userId: string;
  role: string;
}

const sessions: Record<string, AuthSession> = {};

export async function login(app: Express, email: string, password = 'demo1234'): Promise<AuthSession> {
  const key = `${email}:${password}`;
  if (sessions[key]) return sessions[key];

  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const session: AuthSession = {
    token: res.body.token,
    refreshToken: res.body.refreshToken,
    userId: res.body.user.id,
    role: res.body.user.role,
  };
  sessions[key] = session;
  return session;
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export const SHIPPER_EMAIL = 'shipper@jebelalilogistics.ae';
export const CARRIER_EMAIL = 'carrier@dubaidrayage.com';
export const ADMIN_EMAIL = 'admin@loadbyton.ae';

export function validJobPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    containerSize: 'FORTY_HC',
    containerType: 'DRY',
    containerNumber: 'MSKU9876543',
    pickupTerminal: 'JEBEL_ALI_T2',
    deliveryArea: 'JAFZA_SOUTH',
    deliveryAddress: 'Warehouse 12, JAFZA South, Dubai',
    readyTime: new Date(Date.now() + 3600000 * 3).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24).toISOString(),
    maxBudgetAED: 1500,
    requiresReefer: false,
    requiresHazmat: false,
    ...overrides,
  };
}
