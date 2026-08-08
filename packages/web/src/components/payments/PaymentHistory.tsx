import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { formatCurrencyAED } from '@/lib/utils';
import type { Payment } from '@/types';

const STATUS_VARIANT: Record<Payment['status'], BadgeProps['variant']> = {
  PENDING: 'open',
  ESCROW: 'teal',
  RELEASED: 'completed',
  DISPUTED: 'cancelled',
};

export const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchApi<Payment[]>('/payments/history')
      .then((data) => {
        if (active) {
          setPayments(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load payments');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading payments…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Net to Carrier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs text-navy-700">{payment.jobCode ?? payment.jobId}</TableCell>
                  <TableCell className="font-mono font-semibold text-gray-900">
                    {formatCurrencyAED(payment.amountAED)}
                  </TableCell>
                  <TableCell className="font-mono text-gray-500">{formatCurrencyAED(payment.platformFeeAED)}</TableCell>
                  <TableCell className="font-mono font-semibold text-brand-teal">
                    {formatCurrencyAED(payment.netCarrierAED)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[payment.status]}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{payment.transactionRef ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
