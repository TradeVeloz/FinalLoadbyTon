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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 hover:scale-[1.03] active:scale-[0.96] will-change-transform whitespace-nowrap select-none';

  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md shadow-brand-orange/25',
    secondary: 'bg-navy-800 text-white hover:bg-navy-700 shadow-md shadow-navy-900/20 dark:bg-navy-700 dark:hover:bg-navy-600',
    outline: 'border-2 border-gray-300 text-gray-700 bg-white hover:border-navy-800 hover:text-navy-800 dark:border-gray-700 dark:text-gray-200 dark:bg-transparent dark:hover:border-gray-500 dark:hover:text-white',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-navy-800 dark:text-gray-300 dark:hover:bg-navy-800 dark:hover:text-white',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20',
    teal: 'bg-brand-teal text-white hover:bg-teal-700 shadow-md shadow-brand-teal/20'
  };

  const sizes = {
    sm: 'px-4 h-10 text-sm',
    md: 'px-5 h-11 text-sm',
    lg: 'px-7 h-12 text-base'
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
