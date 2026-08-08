import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, label, options, error, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
        {label}
      </label>
    )}
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:ring-red-500/20",
        className
      )}
      ref={ref}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
  </div>
));

Select.displayName = 'Select';
