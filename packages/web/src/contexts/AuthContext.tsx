import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('loadbyton_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-shipper-1',
      email: 'shipper@uaeports.ae',
      role: 'SHIPPER',
      profile: {
        companyName: 'Al-Majid Global Freight LLC',
        trnNumber: 'TRN-100293847500003',
        ratingAverage: 4.9,
        completedJobsCount: 142
      }
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('loadbyton_token') || 'mock-jwt-token');

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('loadbyton_user', JSON.stringify(userData));
    localStorage.setItem('loadbyton_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('loadbyton_user');
    localStorage.removeItem('loadbyton_token');
  };

  const setRole = (role: Role) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('loadbyton_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'SHIPPER',
      token,
      login,
      logout,
      setRole,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
