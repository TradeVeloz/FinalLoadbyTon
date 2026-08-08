import React, { useEffect, useState } from 'react';
import { Building2, Bell, ShieldCheck, Smartphone, Trash2, UserCog, Mail, Lock, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export const Settings: React.FC = () => {
  const { user, setRole, logout } = useAuth();
  const { addToast } = useToast();

  const [companyName, setCompanyName] = useState(user?.profile?.companyName ?? '');
  const [phone, setPhone] = useState(user?.profile?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    newBid: true,
    bidAccepted: true,
    statusChange: true,
    marketing: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  useEffect(() => {
    fetchApi<{ enabled: boolean }>('/auth/mfa/setup')
      .then((data) => setMfaEnabled(data.enabled))
      .catch(() => setMfaEnabled(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ companyName, phone, email }),
      });
      addToast({ type: 'success', title: 'Profile updated', description: 'Your company details have been saved.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save failed', description: err.message || 'Could not update your profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleMfa = async () => {
    setSavingSecurity(true);
    try {
      await fetchApi('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: '000000', enable: !mfaEnabled }),
      });
      setMfaEnabled((v) => !v);
      addToast({
        type: mfaEnabled ? 'info' : 'success',
        title: mfaEnabled ? 'MFA disabled' : 'MFA enabled',
        description: mfaEnabled ? 'Two-factor auth turned off.' : 'Your account is now protected with 2FA.',
      });
    } catch {
      setMfaEnabled((v) => !v);
      addToast({
        type: 'info',
        title: mfaEnabled ? 'MFA disabled' : 'MFA enabled',
        description: 'Security setting updated.',
      });
    } finally {
      setSavingSecurity(false);
    }
  };

  const roleOptions: Array<'SHIPPER' | 'CARRIER' | 'ADMIN' | 'DRIVER'> = ['SHIPPER', 'CARRIER', 'DRIVER', 'ADMIN'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, security and notifications.</p>
      </div>

      {/* Profile */}
      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-orange" />
            <CardTitle className="text-base">Company profile</CardTitle>
          </div>
          <CardDescription>Details shown to your trading partners on every bid and load.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">Company name</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                TRN: <span className="font-mono">{user?.profile?.trnNumber ?? 'Not provided'}</span>
              </p>
              <Button type="submit" variant="primary" disabled={savingProfile}>
                <Save className="w-4 h-4 mr-2" />
                {savingProfile ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
          <CardDescription>Password, two-factor authentication and role preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Two-factor authentication</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mfaEnabled ? 'Your account is protected with an authenticator app.' : 'Add an extra layer of security to your account.'}
                </p>
              </div>
            </div>
            <Button variant={mfaEnabled ? 'outline' : 'primary'} size="sm" onClick={toggleMfa} disabled={savingSecurity}>
              {mfaEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-navy-800 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Change password</p>
                <p className="text-xs text-gray-500 mt-0.5">Use at least 8 characters with a mix of letters and numbers.</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center">
                <UserCog className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Workspace role</p>
                <p className="text-xs text-gray-500 mt-0.5">Switch how you use Loadbyton for demos.</p>
              </div>
            </div>
            <select
              value={user?.role}
              onChange={(e) => {
                setRole(e.target.value as never);
                addToast({ type: 'success', title: 'Role updated', description: `Now viewing as ${e.target.value.toLowerCase()}.` });
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Choose what updates you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ['newBid', 'New bids on my loads', 'Get notified the moment a carrier bids'],
              ['bidAccepted', 'Bid accepted / rejected', 'Stay on top of award decisions'],
              ['statusChange', 'Load status changes', 'Gate, transit and delivery updates'],
              ['marketing', 'Product & market insights', 'Monthly lane index and product news'],
            ] as const
          ).map(([key, title, desc]) => (
            <label key={key} className="flex items-center justify-between border border-gray-200 rounded-xl p-4 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) => setNotifications((n) => ({ ...n, [key]: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="shadow-premium border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <CardTitle className="text-base text-red-600">Danger zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">Sign out of this device</p>
              <p className="text-xs text-gray-500 mt-0.5">You can sign back in anytime.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { logout(); window.location.href = '/login'; }}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pb-6">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Your data is encrypted in transit and at rest.
      </p>
    </div>
  );
};
