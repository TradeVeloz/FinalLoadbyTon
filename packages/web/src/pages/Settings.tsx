import React, { useEffect, useState } from 'react';
import { Building2, Bell, ShieldCheck, Smartphone, Trash2, UserCog, Mail, Lock, Save, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export const Settings: React.FC = () => {
  const { user, setRole, logout, updateUser } = useAuth();
  const { addToast } = useToast();

  const [companyName, setCompanyName] = useState(user?.profile?.companyName ?? '');
  const [phone, setPhone] = useState(user?.profile?.phone ?? '');
  const [email] = useState(user?.email ?? '');
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false);
  const [mfaSetup, setMfaSetup] = useState<MfaSetupResponse | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [notifications, setNotifications] = useState({
    newBid: true,
    bidAccepted: true,
    statusChange: true,
    marketing: false,
  });
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  useEffect(() => {
    fetchApi<{ prefs: typeof notifications }>('/users/notifications')
      .then((data) => setNotifications((prev) => ({ ...prev, ...data.prefs })))
      .catch(() => undefined);
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ companyName, phone }),
      });
      updateUser({
        profile: {
          ...(user?.profile ?? { ratingAverage: 0, completedJobsCount: 0 }),
          companyName,
          phone,
        },
      });
      addToast({ type: 'success', title: 'Profile updated', description: 'Your company details have been saved.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save failed', description: err.message || 'Could not update your profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const startMfaSetup = async () => {
    setSavingSecurity(true);
    try {
      const data = await fetchApi<MfaSetupResponse>('/auth/mfa/setup', { method: 'POST' });
      setMfaSetup(data);
      setMfaCode('');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not start setup', description: err.message || 'Something went wrong.' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const confirmMfaSetup = async () => {
    if (!mfaSetup) return;
    if (mfaCode.length !== 6) {
      addToast({ type: 'error', title: 'Enter the code', description: 'Enter the 6-digit code from your authenticator app.' });
      return;
    }
    setSavingSecurity(true);
    try {
      const result = await fetchApi<{ success: boolean; mfaEnabled: boolean }>('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: mfaCode, secret: mfaSetup.secret }),
      });
      if (!result.success) {
        addToast({ type: 'error', title: 'Code invalid', description: 'That code did not match. Try again.' });
        return;
      }
      setMfaEnabled(true);
      updateUser({ mfaEnabled: true });
      setMfaSetup(null);
      addToast({ type: 'success', title: 'MFA enabled', description: 'Your account is now protected with 2FA.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not enable MFA', description: err.message || 'Something went wrong.' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const cancelMfaSetup = () => setMfaSetup(null);

  const disableMfa = async () => {
    setSavingSecurity(true);
    try {
      await fetchApi('/auth/mfa/disable', { method: 'POST' });
      setMfaEnabled(false);
      updateUser({ mfaEnabled: false });
      setMfaSetup(null);
      addToast({ type: 'info', title: 'MFA disabled', description: 'Two-factor auth has been turned off.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not disable MFA', description: err.message || 'Something went wrong.' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew.length < 8) {
      addToast({ type: 'error', title: 'Password too short', description: 'Use at least 8 characters.' });
      return;
    }
    if (pwNew !== pwConfirm) {
      addToast({ type: 'error', title: 'Passwords do not match', description: 'New password and confirmation must match.' });
      return;
    }
    setSavingPw(true);
    try {
      await fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      addToast({ type: 'success', title: 'Password changed', description: 'Your password has been updated.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not change password', description: err.message || 'Something went wrong.' });
    } finally {
      setSavingPw(false);
    }
  };

  const saveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await fetchApi('/users/notifications', {
        method: 'PUT',
        body: JSON.stringify(notifications),
      });
      addToast({ type: 'success', title: 'Preferences saved', description: 'Your notification settings were updated.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not save preferences', description: err.message || 'Something went wrong.' });
    } finally {
      setSavingNotifs(false);
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
                <Input type="email" value={email} disabled className="pl-9 bg-gray-50 text-gray-500" />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Your email is your sign-in identifier and cannot be changed from here.
              </p>
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
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
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
              {mfaEnabled ? (
                <Button variant="outline" size="sm" onClick={() => void disableMfa()} disabled={savingSecurity}>
                  Disable
                </Button>
              ) : (
                <Button variant={mfaSetup ? 'outline' : 'primary'} size="sm" onClick={() => void startMfaSetup()} disabled={savingSecurity}>
                  Enable
                </Button>
              )}
            </div>

            {mfaSetup && !mfaEnabled && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Scan or enter the key below in your authenticator app (Google Authenticator, Authy, 1Password…), then
                  enter the 6-digit code it produces to confirm.
                </p>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Secret key</p>
                  <p className="font-mono text-xs text-navy-800 break-all">{mfaSetup.secret}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2 mb-1">Manual entry URI</p>
                  <p className="font-mono text-xs text-gray-500 break-all">{mfaSetup.qrCodeUrl}</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">6-digit code</label>
                    <Input
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="font-mono"
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={() => void confirmMfaSetup()} disabled={savingSecurity || mfaCode.length !== 6}>
                    {savingSecurity ? 'Verifying…' : 'Verify & enable'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelMfaSetup} disabled={savingSecurity}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 text-navy-800 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">Change password</p>
                  <p className="text-xs text-gray-500 mt-0.5">Use at least 8 characters with a mix of letters and numbers.</p>
                </div>
              </div>
            </div>
            <form onSubmit={changePassword} className="mt-4 grid sm:grid-cols-2 gap-3">
              <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
              />
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
              />
              <div className="flex items-end">
                <Button type="submit" variant="outline" size="sm" disabled={savingPw} className="w-full">
                  <KeyRound className="w-4 h-4 mr-2" />
                  {savingPw ? 'Updating…' : 'Update password'}
                </Button>
              </div>
            </form>
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
          <div className="flex justify-end pt-1">
            <Button variant="primary" size="sm" onClick={() => void saveNotifications()} disabled={savingNotifs}>
              <Save className="w-4 h-4 mr-2" />
              {savingNotifs ? 'Saving…' : 'Save preferences'}
            </Button>
          </div>
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
