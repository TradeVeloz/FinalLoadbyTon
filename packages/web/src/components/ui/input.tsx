import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, type = 'text', ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-700 dark:bg-navy-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-brand-orange",
        error && "border-red-500 focus:ring-red-500/20 dark:border-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
  </div>
));

Input.displayName = 'Input';
