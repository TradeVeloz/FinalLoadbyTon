import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export const ForgotPassword: React.FC = () => {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await fetchApi<{ message: string; resetToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      addToast({ type: 'success', title: 'Reset link sent', description: data.message });
    } catch (err: any) {
      setError(err.message || 'Could not request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await fetchApi<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, password }),
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not reset your password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(600px 400px at 80% 20%, rgba(232,116,43,0.12), transparent 60%)',
        }}
      />
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-brand-orange p-2.5 rounded-xl shadow-glow-orange">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-extrabold text-2xl tracking-tight">
                LOAD<span className="text-brand-orange">BYTON</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {done ? (
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h1 className="mt-4 text-xl font-extrabold text-navy-900 tracking-tight">Password reset</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Your password has been changed. You can now sign in with your new credentials.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full mt-6">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            ) : !resetToken ? (
              <>
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Forgot your password?</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your work email and we'll send you a link to reset it.
                </p>

                {error && (
                  <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={requestReset} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5">Work email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.ae"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Choose a new password</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Set a new password for <span className="font-medium text-navy-800">{email}</span>.
                </p>

                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                  Demo mode: no email is sent. Use the dev reset token below to complete the flow.
                </div>
                <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 font-mono text-xs text-gray-600 break-all">
                  {resetToken}
                </div>

                {error && (
                  <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={submitReset} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5">New password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5">Confirm new password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Re-enter your new password"
                        className="pl-9"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Resetting…' : 'Reset password'}
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="inline-flex items-center font-semibold text-brand-orange hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
