import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Bell, User, LogOut, ChevronDown, PlusCircle, Sun, Moon, CheckCheck, Inbox } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useJobs } from '../../hooks/useJobs';
import { useSocketContext } from '../../contexts/SocketContext';
import { fetchApi } from '../../lib/api';
import { Button } from '../ui/button';
import { NotificationItem } from '../../types';

const NotificationsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const { on } = useSocketContext();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchApi<{ notifications: NotificationItem[]; unread: number }>('/notifications');
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const off = on('notification', (payload) => {
      const note = payload as NotificationItem;
      if (note?.id) {
        setItems((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
        setUnread((u) => u + 1);
      }
    });
    return off;
  }, [on]);

  const open = (item: NotificationItem) => {
    onClose();
    if (item.jobId) navigate(`/jobs/${item.jobId}`);
  };

  const markAll = async () => {
    try {
      await fetchApi('/notifications/read-all', { method: 'POST' });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const timeAgo = (iso: string) => {
    const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in dark:bg-navy-900 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-bold text-navy-900 dark:text-white">Notifications</p>
        {unread > 0 && (
          <button
            onClick={() => void markAll()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="w-8 h-8 mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => open(item)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 dark:border-gray-800 dark:hover:bg-navy-800 ${
                item.isRead ? '' : 'bg-orange-50/60 dark:bg-brand-orange/5'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {!item.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { user, role, setRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { jobs } = useJobs();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const trackableJob =
    jobs.find((j) => j.status === 'IN_TRANSIT') ?? jobs.find((j) => j.status === 'AWARDED');

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
          <Link to={trackableJob ? `/tracking/${trackableJob.id}` : '/jobs'} className="hover:text-brand-orange transition-colors">Tracking</Link>
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
          <div className="relative shrink-0" ref={bellRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Open notifications"
              className="relative p-2 text-gray-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors shrink-0"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-navy-900"></span>
            </button>
            {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
          </div>

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
