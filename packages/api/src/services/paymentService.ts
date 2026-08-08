import { PaymentRecord, PaymentStatus } from '../types';
import { calculatePlatformFee } from '../utils/helpers';
import { getJob } from './jobService';

const payments: PaymentRecord[] = [
  {
    id: 'pay-701',
    jobId: 'job-102',
    jobCode: 'LBT-DXB-2608-8812',
    amountAED: 980,
    platformFeeAED: 58.8,
    netCarrierAED: 921.2,
    status: 'ESCROW',
    transactionRef: 'TXN-DXB-88392019',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

export function createEscrow(jobId: string, amountAED: number): PaymentRecord | undefined {
  const job = getJob(jobId);
  if (!job) return undefined;

  const existing = payments.find((p) => p.jobId === jobId);
  if (existing) {
    throw Object.assign(new Error('An escrow payment already exists for this job'), { status: 409 });
  }

  const { platformFee, netAmount } = calculatePlatformFee(amountAED);
  const now = new Date().toISOString();
  const payment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    jobId,
    jobCode: job.jobCode,
    amountAED,
    platformFeeAED: platformFee,
    netCarrierAED: netAmount,
    status: 'ESCROW',
    transactionRef: `TXN-DXB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    createdAt: now,
    updatedAt: now,
  };
  payments.push(payment);
  return payment;
}

export function getPayment(id: string): PaymentRecord | undefined {
  return payments.find((p) => p.id === id);
}

export function getPaymentByJob(jobId: string): PaymentRecord | undefined {
  return payments.find((p) => p.jobId === jobId);
}

export function listPayments(): PaymentRecord[] {
  return payments;
}

export function setPaymentStatus(id: string, status: PaymentStatus): PaymentRecord | undefined {
  const payment = payments.find((p) => p.id === id);
  if (!payment) return undefined;
  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  return payment;
}
