import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Bell, User, LogOut, ChevronDown, PlusCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const { user, role, setRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-700 text-white shadow-lg dark:bg-navy-950 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-4 shrink-0">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-brand-orange to-amber-600 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">LOAD<span className="text-brand-orange">BYTON</span></span>
              <span className="text-[10px] uppercase font-bold bg-brand-teal/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">UAE</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links — moves to the sidebar drawer below xl */}
        <nav className="hidden xl:flex items-center space-x-5 text-sm font-semibold text-gray-300">
          <Link to="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link>
          <Link to="/jobs" className="hover:text-brand-orange transition-colors">Loads & Bids</Link>
          <Link to="/tracking/job-102" className="hover:text-brand-orange transition-colors">Tracking</Link>
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
          
          {role === 'SHIPPER' && (
            <Button
              onClick={() => navigate('/jobs/new')}
              variant="primary"
              size="sm"
              className="flex items-center space-x-1.5 shadow-glow-orange"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Post New Load</span>
            </Button>
          )}

          {/* Role Toggle Switcher for instant demo exploration */}
          <div className="hidden md:flex items-center bg-navy-800 p-1 rounded-lg border border-navy-700 dark:bg-navy-900 dark:border-navy-700">
            <button
              onClick={() => setRole('SHIPPER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === 'SHIPPER' ? 'bg-brand-orange text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Shipper
            </button>
            <button
              onClick={() => setRole('CARRIER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                role === 'CARRIER' ? 'bg-brand-teal text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Carrier
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative p-2 text-gray-300 hover:text-white hover:bg-navy-800 dark:hover:bg-navy-800 rounded-lg transition-colors shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Bell */}
          <button className="relative p-2 text-gray-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors shrink-0">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-navy-900"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center font-bold text-white text-xs">
                {user?.profile?.companyName?.substring(0, 2).toUpperCase() || 'LB'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.profile?.companyName || 'Al-Majid Freight'}</p>
                <p className="text-[10px] text-brand-orange font-semibold tracking-wider">{role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 text-gray-800 z-50 animate-fade-in dark:bg-navy-900 dark:border-gray-800 dark:text-gray-100">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-navy-950/50">
                  <p className="text-xs font-bold text-navy-900 dark:text-white">{user?.profile?.companyName}</p>
                  <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full dark:text-emerald-300 dark:bg-emerald-900/50">
                    TRN Verified ✓
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium dark:text-gray-200 dark:hover:bg-navy-800"
                >
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Company Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100 dark:text-red-400 dark:hover:bg-red-950/40 dark:border-gray-800"
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
