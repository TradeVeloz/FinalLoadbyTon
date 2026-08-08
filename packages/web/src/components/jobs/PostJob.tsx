import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LocationInput, GeoLocation } from '@/components/ui/location-input';
import { useToast } from '@/hooks/useToast';
import { useJobs } from '@/hooks/useJobs';

const CONTAINER_SIZE_OPTIONS = [
  { value: 'TWENTY_FT', label: "20' Standard Dry" },
  { value: 'FORTY_FT', label: "40' Standard Dry" },
  { value: 'FORTY_HC', label: "40' High Cube (HC)" },
  { value: 'REEFER', label: "40' Refrigerated (Reefer)" },
];

const CONTAINER_TYPE_OPTIONS = [
  { value: 'DRY', label: 'Dry' },
  { value: 'REEFER', label: 'Reefer' },
  { value: 'HAZMAT', label: 'Hazmat' },
  { value: 'OPEN_TOP', label: 'Open Top' },
  { value: 'FLAT_RACK', label: 'Flat Rack' },
];

interface PostJobForm {
  containerSize: string;
  containerType: string;
  containerNumber: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  readyTime: string;
  deadline: string;
  requiresReefer: boolean;
  requiresHazmat: boolean;
  hazmatClass: string;
  notes: string;
  maxBudgetAED: string;
}

const EMPTY_FORM: PostJobForm = {
  containerSize: '',
  containerType: '',
  containerNumber: '',
  pickupAddress: '',
  deliveryAddress: '',
  readyTime: '',
  deadline: '',
  requiresReefer: false,
  requiresHazmat: false,
  hazmatClass: '',
  notes: '',
  maxBudgetAED: '',
};

const STEP_TITLES = [
  'Container Details',
  'Route',
  'Timing',
  'Special Requirements',
  'Budget',
  'Review & Post',
];

type Errors = Record<string, string>;

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { createJob } = useJobs();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PostJobForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof PostJobForm>(key: K, value: PostJobForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (current: number): Errors => {
    const next: Errors = {};
    if (current === 1) {
      if (!form.containerSize) next.containerSize = 'Select a container size';
      if (!form.containerType) next.containerType = 'Select a container type';
    }
    if (current === 2) {
      if (!form.pickupAddress.trim()) next.pickupAddress = 'Pickup location is required';
      if (!form.deliveryAddress.trim()) next.deliveryAddress = 'Drop-off location is required';
    }
    if (current === 3) {
      if (!form.readyTime) next.readyTime = 'Pick a ready time';
      if (!form.deadline) next.deadline = 'Pick a deadline';
      if (form.readyTime && form.deadline && new Date(form.readyTime) > new Date(form.deadline)) {
        next.deadline = 'Deadline must be after ready time';
      }
    }
    if (current === 4 && form.requiresHazmat && !form.hazmatClass.trim()) {
      next.hazmatClass = 'Hazmat class is required';
    }
    return next;
  };

  const handleNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(6);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setStep(6);
      return;
    }
    setSubmitting(true);
    try {
      const created = await createJob({
        containerSize: form.containerSize,
        containerType: form.containerType,
        containerNumber: form.containerNumber.trim() || undefined,
        pickupAddress: form.pickupAddress.trim(),
        pickupLat: form.pickupLat,
        pickupLng: form.pickupLng,
        deliveryAddress: form.deliveryAddress.trim(),
        deliveryLat: form.deliveryLat,
        deliveryLng: form.deliveryLng,
        readyTime: new Date(form.readyTime).toISOString(),
        deadline: new Date(form.deadline).toISOString(),
        maxBudgetAED: form.maxBudgetAED ? Number(form.maxBudgetAED) : undefined,
        requiresReefer: !!form.requiresReefer,
        requiresHazmat: !!form.requiresHazmat,
        hazmatClass: form.requiresHazmat ? form.hazmatClass.trim() : undefined,
        notes: form.notes.trim() || undefined,
      });
      addToast({
        type: 'success',
        title: 'Load posted',
        description: `${created.jobCode} is now open for bidding.`,
      });
      navigate(`/jobs/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      addToast({ type: 'error', title: 'Could not post load', description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.round((step / 6) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Post a New Load</h1>
        <p className="text-sm text-gray-500">
          Step {step} of 6 — {STEP_TITLES[step - 1]}
        </p>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-brand-orange rounded-full transition-colors"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>{STEP_TITLES[step - 1]}</CardTitle>
          <CardDescription>
            {step === 1 && 'Pick the container you need moved.'}
            {step === 2 && 'Where in the UAE should the container be picked up and dropped off?'}
            {step === 3 && 'When is the container ready and when must it arrive?'}
            {step === 4 && 'Flag any special handling requirements.'}
            {step === 5 && 'Set an optional maximum budget for carriers to bid against.'}
            {step === 6 && 'Review everything before posting.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <Select
                label="Container size"
                value={form.containerSize}
                onChange={(e) => setField('containerSize', e.target.value)}
                options={[{ value: '', label: 'Select size' }, ...CONTAINER_SIZE_OPTIONS]}
                error={errors.containerSize}
              />
              <Select
                label="Container type"
                value={form.containerType}
                onChange={(e) => setField('containerType', e.target.value)}
                options={[{ value: '', label: 'Select type' }, ...CONTAINER_TYPE_OPTIONS]}
                error={errors.containerType}
              />
              <Input
                label="Container number (optional)"
                placeholder="MSKU9281745"
                className="font-mono"
                value={form.containerNumber}
                onChange={(e) => setField('containerNumber', e.target.value)}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-start gap-2.5 rounded-lg bg-brand-teal-light px-3.5 py-3 text-sm text-brand-teal">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                Search anywhere in the UAE — ports, terminals, warehouses or street addresses.
                Powered by OpenStreetMap.
              </div>
              <LocationInput
                label="Pickup location"
                placeholder="Search any location in the UAE…"
                value={form.pickupAddress}
                onChange={(v) => setField('pickupAddress', v)}
                onSelect={(loc: GeoLocation) =>
                  setForm((prev) => ({ ...prev, pickupAddress: loc.name, pickupLat: loc.lat, pickupLng: loc.lng }))
                }
                onClear={() => setForm((prev) => ({ ...prev, pickupLat: undefined, pickupLng: undefined }))}
                error={errors.pickupAddress}
              />
              <LocationInput
                label="Drop-off location"
                placeholder="Search any location in the UAE…"
                value={form.deliveryAddress}
                onChange={(v) => setField('deliveryAddress', v)}
                onSelect={(loc: GeoLocation) =>
                  setForm((prev) => ({ ...prev, deliveryAddress: loc.name, deliveryLat: loc.lat, deliveryLng: loc.lng }))
                }
                onClear={() => setForm((prev) => ({ ...prev, deliveryLat: undefined, deliveryLng: undefined }))}
                error={errors.deliveryAddress}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Input
                label="Ready time"
                type="datetime-local"
                value={form.readyTime}
                onChange={(e) => setField('readyTime', e.target.value)}
                error={errors.readyTime}
              />
              <Input
                label="Deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setField('deadline', e.target.value)}
                error={errors.deadline}
              />
            </>
          )}

          {step === 4 && (
            <>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-orange"
                  checked={form.requiresReefer}
                  onChange={(e) => setField('requiresReefer', e.target.checked)}
                />
                <span className="text-sm font-semibold text-gray-700">Requires reefer (temperature-controlled)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-orange"
                  checked={form.requiresHazmat}
                  onChange={(e) => setField('requiresHazmat', e.target.checked)}
                />
                <span className="text-sm font-semibold text-gray-700">Requires hazmat handling</span>
              </label>
              {form.requiresHazmat && (
                <Input
                  label="Hazmat class"
                  placeholder="Class 3 — Flammable Liquid"
                  value={form.hazmatClass}
                  onChange={(e) => setField('hazmatClass', e.target.value)}
                  error={errors.hazmatClass}
                />
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  placeholder="Gate access details, dock requirements, contact info…"
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </div>
            </>
          )}

          {step === 5 && (
            <Input
              label="Maximum budget (AED, optional)"
              type="number"
              min={0}
              placeholder="1400"
              value={form.maxBudgetAED}
              onChange={(e) => setField('maxBudgetAED', e.target.value)}
            />
          )}

          {step === 6 && (
            <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {[
                ['Container', form.containerNumber
                  ? `${formatLabel(CONTAINER_SIZE_OPTIONS, form.containerSize)} — ${form.containerNumber}`
                  : formatLabel(CONTAINER_SIZE_OPTIONS, form.containerSize)],
                ['Container type', formatLabel(CONTAINER_TYPE_OPTIONS, form.containerType)],
                ['Pickup location', form.pickupAddress || '—'],
                ['Drop-off location', form.deliveryAddress || '—'],
                ['Ready time', new Date(form.readyTime).toLocaleString('en-AE')],
                ['Deadline', new Date(form.deadline).toLocaleString('en-AE')],
                ['Reefer required', form.requiresReefer ? 'Yes' : 'No'],
                ['Hazmat required', form.requiresHazmat ? `Yes${form.hazmatClass ? ` — ${form.hazmatClass}` : ''}` : 'No'],
                ['Budget', form.maxBudgetAED ? `${Number(form.maxBudgetAED).toLocaleString('en-AE')} AED` : 'Open (no maximum)'],
                ...(form.notes ? [['Notes', form.notes]] : []),
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-navy-800 sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {step === 6 && (
            <div className="flex items-center gap-2 rounded-lg bg-brand-teal-light p-3 text-sm text-brand-teal">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Once posted, carriers can bid on this load. You can review and accept bids anytime.
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || submitting}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            {step < 6 ? (
              <Button variant="primary" onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? 'Posting…' : 'Post Load for Bidding'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function formatLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
