import React, { useState } from 'react';
import { HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBids } from '@/hooks/useBids';
import { useToast } from '@/hooks/useToast';
import { formatCurrencyAED } from '@/lib/utils';

interface SubmitBidForm {
  amountAED: string;
  etaMinutes: string;
  truckType: string;
  driverName: string;
  notes: string;
}

const EMPTY_FORM: SubmitBidForm = {
  amountAED: '',
  etaMinutes: '',
  truckType: '',
  driverName: '',
  notes: '',
};

export const SubmitBid: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { submitBid } = useBids();
  const { addToast } = useToast();
  const [form, setForm] = useState<SubmitBidForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<{ amountAED?: string; etaMinutes?: string; truckType?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof SubmitBidForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof typeof prev];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountAED = Number(form.amountAED);
    const etaMinutes = Number(form.etaMinutes);
    const nextErrors: { amountAED?: string; etaMinutes?: string; truckType?: string } = {};
    if (!amountAED || amountAED <= 0) nextErrors.amountAED = 'Enter an amount greater than 0';
    if (!etaMinutes || etaMinutes <= 0) nextErrors.etaMinutes = 'Enter an ETA greater than 0';
    if (!form.truckType.trim() || form.truckType.trim().length < 2) {
      nextErrors.truckType = 'Enter a truck type (e.g. 40ft flatbed)';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await submitBid(jobId, {
        amountAED,
        etaMinutes,
        truckType: form.truckType.trim(),
        driverName: form.driverName.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      addToast({
        type: 'success',
        title: 'Bid submitted',
        description: `Your bid of ${formatCurrencyAED(amountAED)} is now pending.`,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could not submit bid',
        description: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-brand-orange" />
          Place Your Bid
        </CardTitle>
        <CardDescription>
          Submit your best offer for this load. The shipper will review all bids.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            label="Bid Amount (AED)"
            type="number"
            min={1}
            step={1}
            placeholder="1400"
            className="font-mono"
            value={form.amountAED}
            onChange={(e) => setField('amountAED', e.target.value)}
            error={errors.amountAED}
          />
          <Input
            label="ETA (minutes)"
            type="number"
            min={1}
            step={1}
            placeholder="90"
            value={form.etaMinutes}
            onChange={(e) => setField('etaMinutes', e.target.value)}
            error={errors.etaMinutes}
          />
          <Input
            label="Truck type"
            placeholder="40ft flatbed / curtain-side"
            value={form.truckType}
            onChange={(e) => setField('truckType', e.target.value)}
            error={errors.truckType}
          />
          <Input
            label="Driver name (optional)"
            placeholder="Driver 7865"
            value={form.driverName}
            onChange={(e) => setField('driverName', e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              placeholder="Availability, terminal wait times, special equipment…"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Bid'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
