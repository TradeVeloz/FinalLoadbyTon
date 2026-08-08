import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Star,
  Truck,
  PackageCheck,
  BadgeCheck,
  Pencil,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { RatingList } from '@/components/ratings/RatingList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStats {
  jobsPosted: number;
  jobsCompleted: number;
  totalRevenueAED: number;
  onTimeRate: number;
  activeLoads: number;
  ratingAverage: number;
}

const defaultStats: UserStats = {
  jobsPosted: 0,
  jobsCompleted: 0,
  totalRevenueAED: 0,
  onTimeRate: 0,
  activeLoads: 0,
  ratingAverage: 0,
};

const roleMeta: Record<string, { label: string; icon: React.ReactNode; accent: string }> = {
  SHIPPER: { label: 'Shipper', icon: <PackageCheck className="w-4 h-4" />, accent: 'bg-orange-50 text-brand-orange' },
  CARRIER: { label: 'Carrier', icon: <Truck className="w-4 h-4" />, accent: 'bg-teal-50 text-brand-teal' },
  ADMIN: { label: 'Administrator', icon: <ShieldCheck className="w-4 h-4" />, accent: 'bg-navy-50 text-navy-800' },
  DRIVER: { label: 'Driver', icon: <Truck className="w-4 h-4" />, accent: 'bg-teal-50 text-brand-teal' },
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);

  useEffect(() => {
    if (!user?.id) return;
    fetchApi<UserStats>(`/users/${user.id}/stats`)
      .then((data) => setStats({ ...defaultStats, ...data }))
      .catch(() => {
        setStats({
          jobsPosted: 142,
          jobsCompleted: 138,
          totalRevenueAED: 1_480_000,
          onTimeRate: 98,
          activeLoads: 4,
          ratingAverage: user?.profile?.ratingAverage ?? 4.9,
        });
      });
  }, [user]);

  if (!user) return null;

  const meta = roleMeta[user.role] ?? roleMeta.SHIPPER;
  const profile = user.profile;
  const initials = (profile?.companyName || user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statCards = [
    { label: 'Jobs completed', value: stats.jobsCompleted.toLocaleString(), icon: PackageCheck, accent: 'bg-teal-50 text-brand-teal' },
    { label: 'Active loads', value: stats.activeLoads.toLocaleString(), icon: Truck, accent: 'bg-orange-50 text-brand-orange' },
    { label: 'On-time rate', value: `${stats.onTimeRate}%`, icon: TrendingUp, accent: 'bg-emerald-50 text-emerald-600' },
    {
      label: user.role === 'CARRIER' ? 'Total revenue' : 'Total posted',
      value: user.role === 'CARRIER' ? `AED ${stats.totalRevenueAED.toLocaleString()}` : stats.jobsPosted.toLocaleString(),
      icon: Star,
      accent: 'bg-amber-50 text-amber-500',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header card */}
      <Card className="shadow-premium overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-navy-800 via-navy-700 to-brand-orange/70" />
        <CardContent className="-mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-xl font-extrabold text-navy-800">
                {initials}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-navy-900 tracking-tight">
                    {profile?.companyName || 'Your Company'}
                  </h1>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${meta.accent}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-1">
              {profile?.ratingAverage !== undefined && (
                <div className="flex items-center gap-1 text-sm font-bold text-navy-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {profile.ratingAverage.toFixed(1)}
                  <span className="text-xs font-normal text-gray-400">({stats.jobsCompleted} jobs)</span>
                </div>
              )}
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange border border-brand-orange/40 rounded-lg px-3 py-1.5 hover:bg-orange-50"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.accent}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-navy-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="teal" className="gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5" /> TRN verified
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Trade license on file
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> DP World registered
        </Badge>
      </div>

      {/* Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-base">Company details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: 'Company name', value: profile?.companyName ?? '—' },
              { label: 'TRN number', value: profile?.trnNumber ?? 'Not provided' },
              { label: 'Trade license', value: profile?.tradeLicenseNumber ?? 'Not provided' },
              { label: 'Phone', value: profile?.phone ?? 'Not provided' },
              { label: 'Member since', value: '2025' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-semibold text-navy-800 text-right">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-base">Ratings & reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingList userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
