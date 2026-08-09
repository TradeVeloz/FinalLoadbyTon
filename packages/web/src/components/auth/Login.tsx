import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { User } from '@/types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await fetchApi<{ user: User; token: string; requiresMfa?: boolean }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.requiresMfa) {
        sessionStorage.setItem('loadbyton_pending_mfa', email);
        setMfaRequired(true);
        addToast({ type: 'warning', title: '2FA required', description: 'Enter your verification code to continue.' });
        navigate('/mfa');
        return;
      }
      login(data.user, data.token);
      addToast({ type: 'success', title: 'Welcome back', description: `Signed in as ${data.user.email}` });
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(700px 400px at 80% 10%, rgba(232,116,43,0.15), transparent 60%), radial-gradient(600px 400px at 10% 95%, rgba(26,122,106,0.12), transparent 60%)',
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
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Sign in to your workspace</h1>
            <p className="mt-1 text-sm text-gray-500">
              Post loads, bid on containers and track moves from one place.
            </p>

            {error && (
              <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mfaRequired && (
              <div className="mt-4 flex items-start space-x-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2.5 text-sm">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>MFA is enabled on this account. You will be asked for a code next.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-navy-800"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-medium text-brand-orange hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            New to Loadbyton?{' '}
            <Link to="/register" className="font-semibold text-brand-orange hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
