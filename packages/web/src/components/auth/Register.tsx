import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { User, Role } from '@/types';

type AccountType = 'SHIPPER' | 'CARRIER';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [accountType, setAccountType] = useState<AccountType>('SHIPPER');
  const [companyName, setCompanyName] = useState('');
  const [trnNumber, setTrnNumber] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await fetchApi<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          role: accountType as Role,
          companyName,
          trnNumber,
          tradeLicenseNumber: tradeLicense,
        }),
      });
      login(data.user, data.token);
      addToast({ type: 'success', title: 'Account created', description: `Welcome to Loadbyton, ${data.user.profile?.companyName || ''}` });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const typeCard = (type: AccountType, icon: React.ReactNode, title: string, desc: string) => (
    <button
      type="button"
      onClick={() => setAccountType(type)}
      className={`flex-1 text-left rounded-xl border-2 p-4 transition-all ${
        accountType === type
          ? 'border-brand-orange bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            accountType === type ? 'bg-brand-orange text-white' : 'bg-navy-100 text-navy-800'
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-navy-900">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
    </button>
  );

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
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Free to join. Start posting or bidding in minutes.</p>

            {error && (
              <div className="mt-4 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-medium text-navy-800 mb-2">I am a…</p>
              <div className="flex gap-3">
                {typeCard('SHIPPER', <Building2 className="w-4 h-4" />, 'Shipper', 'I post loads')}
                {typeCard('CARRIER', <Truck className="w-4 h-4" />, 'Carrier', 'I bid on loads')}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  {accountType === 'SHIPPER' ? 'Company name' : 'Fleet / company name'}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    required
                    placeholder={accountType === 'SHIPPER' ? 'Al-Majid Global Freight LLC' : 'Emirates Overland Haulage'}
                    className="pl-9"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">TRN</label>
                  <Input
                    required
                    placeholder="TRN-1002938475"
                    value={trnNumber}
                    onChange={(e) => setTrnNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5">License no.</label>
                  <Input
                    placeholder="Trade license"
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                  />
                </div>
              </div>

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
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 text-xs text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  By creating an account you agree to the Terms of Service and acknowledge our commitment to
                  compliance with DP World and RTA guidelines.
                </span>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-orange hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
