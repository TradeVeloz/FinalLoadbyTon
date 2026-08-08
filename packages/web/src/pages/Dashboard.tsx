import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShipperDashboard } from '@/components/dashboard/ShipperDashboard';
import { CarrierDashboard } from '@/components/dashboard/CarrierDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'CARRIER':
      return <CarrierDashboard />;
    case 'DRIVER':
      return <CarrierDashboard />;
    default:
      return <ShipperDashboard />;
  }
};
