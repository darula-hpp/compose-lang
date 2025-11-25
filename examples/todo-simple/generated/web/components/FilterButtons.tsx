import React from 'react';
import { TodoFilter } from '@/lib/types';
import clsx from 'clsx';

interface FilterButtonsProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
  const filters: { label: string; value: TodoFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-md" role="group" aria-label="Todo filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
            currentFilter === filter.value
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-secondary-light dark:text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-pressed={currentFilter === filter.value}
          aria-label={`Show ${filter.label} todos`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
