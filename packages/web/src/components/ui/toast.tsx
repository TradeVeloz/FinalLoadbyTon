import React, { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-navy-600',
  warning: 'text-amber-600',
};

const barColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-navy-500',
  warning: 'bg-amber-500',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white rounded-xl border border-gray-200 shadow-premium overflow-hidden animate-slide-in-bottom dark:bg-navy-900 dark:border-gray-700"
              role="status"
            >
              <div className={cn("h-1 w-full", barColors[toast.type])} />
              <div className="flex items-start gap-3 p-4">
                <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", iconColors[toast.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy-900 dark:text-white">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-sm text-gray-500 leading-snug dark:text-gray-400">{toast.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-navy-800"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
