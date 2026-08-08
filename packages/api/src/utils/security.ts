import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-loadbyton-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-loadbyton-2026';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function verifyMfaToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}
