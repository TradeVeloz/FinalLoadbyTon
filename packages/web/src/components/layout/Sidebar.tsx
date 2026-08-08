import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Container,
  Gavel,
  Truck,
  MapPin,
  User,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: '/jobs', label: 'Loads & Bids', icon: <Container className="w-4 h-4" />, roles: ['SHIPPER', 'CARRIER'] },
  { to: '/jobs/new', label: 'Post Load', icon: <Truck className="w-4 h-4" />, roles: ['SHIPPER'] },
  { to: '/bids', label: 'My Bids', icon: <Gavel className="w-4 h-4" />, roles: ['CARRIER'] },
  { to: '/tracking/job-102', label: 'Live Tracking', icon: <MapPin className="w-4 h-4" /> },
  { to: '/profile', label: 'Company Profile', icon: <User className="w-4 h-4" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { to: '/admin', label: 'Admin Console', icon: <ShieldCheck className="w-4 h-4" />, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const visible = navItems.filter((item) => !item.roles || item.roles.includes(role));

  const content = (
    <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
      {visible.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
              isActive
                ? 'bg-brand-orange/15 text-brand-orange border-l-2 border-brand-orange'
                : 'text-gray-400 hover:text-white hover:bg-navy-800/70 border-l-2 border-transparent'
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}

      <div className="pt-6 mt-6 border-t border-navy-800">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
          Marketplace
        </p>
        <div className="px-3 py-3 bg-navy-800/60 rounded-xl border border-navy-700">
          <p className="text-xs font-semibold text-white">Live lane index</p>
          <p className="text-xs text-gray-400 mt-1">Jebel Ali T2 → JAFZA</p>
          <p className="text-base font-bold text-emerald-400">AED 1,180</p>
          <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500 rounded-full" />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">Avg. of 128 moves / 24h</p>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-brand-orange text-white p-3 rounded-full shadow-glow-orange"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-72 bg-navy-950 border-r border-navy-800 flex flex-col animate-fade-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-navy-800">
              <span className="font-extrabold text-white tracking-tight">
                LOAD<span className="text-brand-orange">BYTON</span>
              </span>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-navy-950 border-r border-navy-800 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>
    </>
  );
};
