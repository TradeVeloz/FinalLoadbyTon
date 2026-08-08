import { randomUUID } from 'crypto';

export function uid(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function generateJobCode(): string {
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `LBT-DXB-${dateStr}-${randomNum}`;
}

export function calculatePlatformFee(amountAED: number, takeRate: number = 0.06): { platformFee: number; netAmount: number } {
  const platformFee = Math.round(amountAED * takeRate * 100) / 100;
  const netAmount = Math.round((amountAED - platformFee) * 100) / 100;
  return { platformFee, netAmount };
}
