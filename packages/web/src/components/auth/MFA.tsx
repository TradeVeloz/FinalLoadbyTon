import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { User } from '@/types';

export const MFA: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const email = sessionStorage.getItem('loadbyton_pending_mfa') ?? '';

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setError('Enter the full 6-digit code.');
      return;
    }
    if (!email) {
      setError('No pending sign-in found. Please sign in again.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchApi<{ user: User; token: string; refreshToken: string }>('/auth/mfa/challenge', {
        method: 'POST',
        body: JSON.stringify({ email, token: otp }),
      });
      sessionStorage.removeItem('loadbyton_pending_mfa');
      login(data.user, data.token);
      addToast({ type: 'success', title: 'Verified', description: 'Two-factor authentication passed.' });
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Try again.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
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
      <div className="relative flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-brand-orange p-2.5 rounded-xl shadow-glow-orange">
              <Truck className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="mt-4 text-xl font-extrabold text-navy-900 tracking-tight">Two-factor authentication</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit code from your authenticator app to secure your session.
            </p>

            {error && (
              <div className="mt-4 flex items-center justify-center space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
                    setCode(next);
                    inputs.current[Math.min(next.join('').length, 5)]?.focus();
                  }}
                  className="w-11 h-14 text-center text-2xl font-bold text-navy-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30 focus:outline-none"
                />
              ))}
            </div>

            <Button variant="primary" className="w-full mt-6" disabled={loading || code.join('').length !== 6} onClick={verify}>
              {loading ? 'Verifying…' : 'Verify & continue'}
            </Button>

            <div className="mt-4 text-sm text-gray-400">
              Use the 6-digit code from your authenticator app. Codes refresh every 30 seconds.
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            {email ? (
              <>Signed in as <span className="text-gray-200 font-medium">{email}</span></>
            ) : (
              'No pending sign-in found.'
            )}
          </p>
          {!email && (
            <div className="mt-2 text-center">
              <Link to="/login" className="text-sm font-medium text-brand-orange hover:underline">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
