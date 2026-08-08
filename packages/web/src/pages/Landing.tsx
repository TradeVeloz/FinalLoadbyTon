import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Gavel,
  PackageCheck,
  MapPin,
  Star,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';

const trustStats = [
  { value: '15.5M', label: 'TEU handled through Jebel Ali' },
  { value: '500+', label: 'Verified carrier fleets' },
  { value: '98%', label: 'On-time delivery rate' },
  { value: 'AED 6.5B', label: 'Annual serviceable spend' },
];

const steps = [
  {
    number: '01',
    title: 'Post your load',
    description:
      'Enter container details, route and deadline in under two minutes. No phone calls, no back-and-forth WhatsApp.',
    accent: 'border-t-brand-orange',
    icon: PackageCheck,
  },
  {
    number: '02',
    title: 'Carriers bid live',
    description:
      'Vetted drayage fleets compete with transparent prices and ETAs based on real-time truck availability.',
    accent: 'border-t-brand-teal',
    icon: Gavel,
  },
  {
    number: '03',
    title: 'Award, track, get paid',
    description:
      'Compare bids and award in a couple of taps. Escrow protects both sides. Track the move live until POD.',
    accent: 'border-t-navy-500',
    icon: Truck,
  },
];

const testimonials = [
  {
    name: 'Rashid Al-Mansoori',
    role: 'Operations Manager, Al-Majid Global Freight',
    initials: 'RA',
    quote:
      'We used to negotiate every move over the phone. Now the market prices itself — we save ~14% on average and the whole thread is on record.',
    rating: 5,
  },
  {
    name: 'Khalid Saeed',
    role: 'Owner, Emirates Overland Haulage',
    initials: 'KS',
    quote:
      'As a carrier, empty miles are the killer. Loadbyton keeps my fleet full and my trucks at the right terminal at the right time.',
    rating: 5,
  },
  {
    name: 'Fatima Al-Zaabi',
    role: 'Customs Broker, JAFZA',
    initials: 'FZ',
    quote:
      'Gate passes, EIRs and customs bills all live in one thread. My clients can follow their containers without emailing me ten times a day.',
    rating: 4,
  },
];

const lanes = [
  { route: 'Jebel Ali T2 → JAFZA South', price: 'AED 1,180', trend: '+3.1%' },
  { route: 'Jebel Ali T1 → Al Quoz Ind', price: 'AED 1,280', trend: '+1.8%' },
  { route: 'Jebel Ali T4 → Dubai South', price: 'AED 1,450', trend: '-0.6%' },
];

const sampleBids = [
  { carrier: 'Emirates Overland', amount: 1180, eta: '45 min', low: true },
  { carrier: 'Falcon Container', amount: 1220, eta: '30 min', low: false },
  { carrier: 'Gulf Heavy Transport', amount: 1250, eta: '20 min', low: false },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-navy-950 border-b border-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-brand-orange p-2 rounded-xl shadow-glow-orange">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              LOAD<span className="text-brand-orange">BYTON</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(700px 400px at 85% 20%, rgba(232,116,43,0.18), transparent 60%), radial-gradient(600px 400px at 10% 90%, rgba(26,122,106,0.12), transparent 60%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center space-x-2 bg-navy-800/80 border border-navy-700 rounded-full px-3 py-1.5 text-xs text-emerald-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live marketplace · Jebel Ali Port, Dubai</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Move containers faster.
              <br />
              <span className="text-brand-orange">Bid. Award. Track.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-300 max-w-xl leading-relaxed">
              Loadbyton replaces WhatsApp and phone negotiations with a transparent
              bidding system for container drayage — from Jebel Ali terminal to
              warehouse, in one thread.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button variant="primary" size="lg" className="shadow-glow-orange">
                  Post Your First Load
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="border-navy-600 text-white hover:bg-navy-800">
                  Learn How It Works
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified carrier fleets
              </span>
              <span className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-emerald-400" /> Escrow-protected payments
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DP World & RTA compliant
              </span>
            </div>
          </div>

          {/* Live bid preview */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-white">LBT-DXB-2608-4921</p>
                  <p className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3 text-brand-orange" />
                    Jebel Ali T2 → JAFZA South
                  </p>
                </div>
                <Badge variant="bidding">3 live bids</Badge>
              </div>
              <div className="divide-y divide-gray-100">
                {sampleBids.map((bid) => (
                  <div key={bid.carrier} className="px-6 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{bid.carrier}</p>
                      <p className="text-xs text-gray-500">ETA {bid.eta}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {bid.low && <Badge variant="teal">Recommended</Badge>}
                      <span className={`font-mono font-bold ${bid.low ? 'text-emerald-600' : 'text-navy-800'}`}>
                        AED {bid.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-500">
                  Lowest bid{' '}
                  <span className="font-bold text-emerald-600 font-mono">AED 1,180</span> · you award in one tap
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {trustStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl lg:text-4xl font-extrabold text-navy-800 tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-orange">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight">
            From container release to delivered — without a single call
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`bg-white rounded-xl border border-gray-200 border-t-4 ${step.accent} p-6 shadow-premium`}
              >
                <div className="flex items-center justify-between">
                  <step.icon className="w-8 h-8 text-navy-800" />
                  <span className="font-mono text-sm font-bold text-gray-300">{step.number}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace stats */}
      <section className="bg-navy-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Marketplace pulse</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Jebel Ali moves every day on Loadbyton</h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                412 containers moved today, 96 loads posted in the last 24 hours, and an
                average drayage fee of AED 1,180 across the top lanes.
              </p>
              <div className="mt-6 flex gap-8">
                <div>
                  <p className="text-3xl font-extrabold text-brand-orange">412</p>
                  <p className="text-xs text-gray-400 mt-1">Container moves today</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-brand-teal">96</p>
                  <p className="text-xs text-gray-400 mt-1">Loads posted / 24h</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">98%</p>
                  <p className="text-xs text-gray-400 mt-1">On-time delivery</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" /> Live lane index
              </p>
              {lanes.map((lane) => (
                <div
                  key={lane.route}
                  className="flex items-center justify-between bg-navy-800/70 border border-navy-700 rounded-xl px-5 py-3.5"
                >
                  <span className="text-sm text-gray-200">{lane.route}</span>
                  <span className="flex items-center space-x-3">
                    <span className={`text-xs font-semibold ${lane.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {lane.trend}
                    </span>
                    <span className="font-mono font-bold text-white">{lane.price}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-orange">From the field</p>
          <h2 className="mt-2 text-3xl font-extrabold text-navy-900 tracking-tight">
            Trusted by Dubai's freight community
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm text-gray-600 leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-brand-orange to-brand-orange-hover rounded-2xl px-8 py-14 text-center text-white shadow-glow-orange">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Start bidding today</h2>
          <p className="mt-3 max-w-xl mx-auto text-white/90">
            Join 500+ verified carriers and Dubai's leading freight forwarders moving containers through Jebel Ali.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-navy-900 hover:bg-navy-800 shadow-md">
                Create your account
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                Talk to sales
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
