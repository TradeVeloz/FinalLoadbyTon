import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex space-x-1 border-b border-gray-200", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none",
              isActive
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-gray-500 hover:text-navy-800 hover:border-gray-300"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full font-bold",
                isActive ? "bg-orange-100 text-brand-orange" : "bg-gray-100 text-gray-600"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
