import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Bell, ShieldCheck, User, LogOut, ChevronDown, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const { user, role, setRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Ticker */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-brand-orange to-amber-600 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">LOAD<span className="text-brand-orange">BYTON</span></span>
                <span className="text-[10px] uppercase font-bold bg-brand-teal/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">DXB</span>
              </div>
              <p className="hidden sm:block text-[10px] text-gray-300 font-medium tracking-wide">JEBEL ALI DRAYAGE MARKETPLACE</p>
            </div>
          </Link>

          {/* Real-time market ticker indicator */}
          <div className="hidden lg:flex items-center space-x-2 bg-navy-800/80 px-3 py-1.5 rounded-full border border-navy-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">Live Lane Index: <strong className="text-white">Jebel Ali T2 → JAFZA</strong> @ <span className="text-emerald-400">AED 1,180</span></span>
          </div>
        </div>

        {/* Navigation Links — moves to the sidebar drawer below lg */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-300">
          <Link to="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link>
          <Link to="/jobs" className="hover:text-brand-orange transition-colors">Loads & Bids</Link>
          <Link to="/tracking/job-102" className="hover:text-brand-orange transition-colors flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Live Tracking</span>
          </Link>
          <Link to="/admin" className="hover:text-brand-orange transition-colors text-xs text-gray-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {role === 'SHIPPER' && (
            <Button
              onClick={() => navigate('/jobs/new')}
              variant="primary"
              size="sm"
              className="flex items-center space-x-1.5 shadow-glow-orange"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post New Load</span>
            </Button>
          )}

          {/* Role Toggle Switcher for instant demo exploration */}
          <div className="hidden sm:flex items-center bg-navy-800 p-1 rounded-lg border border-navy-700">
            <button
              onClick={() => setRole('SHIPPER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === 'SHIPPER' ? 'bg-brand-orange text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Shipper View
            </button>
            <button
              onClick={() => setRole('CARRIER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === 'CARRIER' ? 'bg-brand-teal text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Carrier View
            </button>
          </div>

          {/* Notifications Bell */}
          <button className="relative p-2 text-gray-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-navy-900"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center font-bold text-white text-xs">
                {user?.profile?.companyName?.substring(0, 2).toUpperCase() || 'LB'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.profile?.companyName || 'Al-Majid Freight'}</p>
                <p className="text-[10px] text-brand-orange font-semibold tracking-wider">{role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 text-gray-800 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-bold text-navy-900">{user?.profile?.companyName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    TRN Verified ✓
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Company Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
