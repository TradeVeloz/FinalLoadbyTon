import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'open' | 'bidding' | 'awarded' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'outline' | 'teal';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'open', children, ...props }) => {
  const variants = {
    open: 'bg-amber-50 text-amber-700 border-amber-200',
    bidding: 'bg-orange-50 text-brand-orange border-orange-200 animate-pulse font-bold',
    awarded: 'bg-blue-50 text-blue-700 border-blue-200',
    in_transit: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    delivered: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-300',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    outline: 'bg-transparent text-gray-700 border-gray-300',
    teal: 'bg-teal-50 text-brand-teal border-teal-200 font-semibold'
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
