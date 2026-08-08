import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'teal';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange-hover focus:ring-brand-orange shadow-md shadow-brand-orange/20',
    secondary: 'bg-navy-800 text-white hover:bg-navy-700 focus:ring-navy-800 shadow-md shadow-navy-900/20',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:ring-navy-800',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-navy-800 focus:ring-navy-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    teal: 'bg-brand-teal text-white hover:bg-teal-700 focus:ring-brand-teal shadow-md shadow-brand-teal/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-bold'
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
