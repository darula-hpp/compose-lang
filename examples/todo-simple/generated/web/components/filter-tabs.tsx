'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TodoStatus } from '@/types';

interface FilterTabsProps {
  currentFilter: TodoStatus;
  onFilterChange: (filter: TodoStatus) => void;
}

const filters: { label: string; value: TodoStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex space-x-2 p-2 rounded-lg bg-primary-50 dark:bg-primary-900">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? 'default' : 'ghost'}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            currentFilter === filter.value
              ? 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
              : 'text-primary-700 hover:bg-primary-200 dark:text-primary-200 dark:hover:bg-primary-800'
          )}
          aria-pressed={currentFilter === filter.value}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
