import { TodoFilter } from '@/types';
import { cn } from '@/lib/utils';

interface FilterButtonsProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

export function FilterButtons({ currentFilter, onFilterChange }: FilterButtonsProps) {
  const filters: { label: string; value: TodoFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex space-x-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-inner">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            currentFilter === filter.value
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
          aria-pressed={currentFilter === filter.value}
          aria-label={`Show ${filter.label} todos`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
