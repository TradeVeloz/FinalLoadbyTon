import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 dark:bg-navy-900 dark:border-gray-800", className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4 border-b border-gray-100 flex flex-col space-y-1.5 dark:border-gray-800", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn("text-lg font-bold text-navy-800 tracking-tight dark:text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-gray-500 font-normal dark:text-gray-400", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between dark:bg-navy-950/50 dark:border-gray-800", className)} {...props}>
    {children}
  </div>
);
