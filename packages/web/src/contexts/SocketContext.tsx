import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextValue {
  connected: boolean;
  joinJob: (jobId: string) => void;
  leaveJob: (jobId: string) => void;
  on: (event: string, handler: (data: unknown) => void) => () => void;
  emit: (event: string, payload: unknown) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      autoConnect: true,
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const joinJob = useCallback((jobId: string) => {
    socketRef.current?.emit('join:job', jobId);
  }, []);

  const leaveJob = useCallback((jobId: string) => {
    socketRef.current?.emit('leave:job', jobId);
  }, []);

  const on = useCallback((event: string, handler: (data: unknown) => void) => {
    socketRef.current?.on(event, handler as (...args: unknown[]) => void);
    return () => {
      socketRef.current?.off(event, handler as (...args: unknown[]) => void);
    };
  }, []);

  const emit = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, joinJob, leaveJob, on, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
