import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { MFA } from './components/auth/MFA';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Bids } from './pages/Bids';
import { Tracking } from './pages/Tracking';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { useAuth } from './hooks/useAuth';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return children;
  }
  return children;
};

const AppShell: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-navy-950 dark:text-gray-100">
    <Header />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/new" element={<Jobs postMode />} />
          <Route path="/jobs/:id" element={<Jobs detailMode />} />
          <Route path="/bids" element={<Bids />} />
          <Route path="/tracking/:jobId" element={<Tracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="/mfa" element={<AuthLayout><MFA /></AuthLayout>} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
};

export default App;
