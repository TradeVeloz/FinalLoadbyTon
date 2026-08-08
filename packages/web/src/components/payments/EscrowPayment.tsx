import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { formatCurrencyAED } from '@/lib/utils';
import type { Payment } from '@/types';

interface EscrowPaymentProps {
  jobId: string;
  amountAED: number;
}

const PLATFORM_FEE_RATE = 0.06;

export const EscrowPayment: React.FC<EscrowPaymentProps> = ({ jobId, amountAED }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [funded, setFunded] = useState(false);

  const platformFeeAED = amountAED * PLATFORM_FEE_RATE;
  const netCarrierAED = amountAED - platformFeeAED;

  const handleFund = async () => {
    setLoading(true);
    try {
      const payment = await fetchApi<Payment>('/payments/escrow', {
        method: 'POST',
        body: JSON.stringify({ jobId, amountAED }),
      });
      setFunded(true);
      addToast({
        type: 'success',
        title: 'Escrow funded',
        description: `Reference ${payment.transactionRef ?? payment.id} — funds secured until delivery is confirmed.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to fund escrow',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-brand-teal" />
          Secure Payment in Escrow
        </CardTitle>
        <CardDescription>Loadbyton holds funds until delivery is confirmed by the shipper.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between rounded-xl bg-navy-900 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Amount held</p>
          <p className="font-mono text-3xl font-bold text-white">{formatCurrencyAED(amountAED)}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Platform fee ({PLATFORM_FEE_RATE * 100}%)</span>
            <span className="font-mono font-semibold text-gray-800">{formatCurrencyAED(platformFeeAED)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Net to carrier</span>
            <span className="font-mono font-semibold text-brand-teal">{formatCurrencyAED(netCarrierAED)}</span>
          </div>
        </div>

        <Button variant="primary" className="w-full" onClick={handleFund} disabled={funded || loading}>
          {funded ? (
            'Escrow Funded'
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Fund Escrow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
