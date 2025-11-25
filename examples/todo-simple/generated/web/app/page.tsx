'use client';

import { useState } from 'react';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { FilterButtons } from '@/components/FilterButtons';
import { Pagination } from '@/components/Pagination';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useTodos } from '@/hooks/useTodos';
import { TodoFilter } from '@/types';
import { DebounceInput } from 'react-debounce-input';
import { cn } from '@/lib/utils';

export default function Home() {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { todos, isLoading, error, totalPages, addTodo, updateTodo, deleteTodo } = useTodos({
    filter,
    page,
    limit: 50, // 50 todos per page as per spec
    searchQuery,
  });

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary-700 dark:text-primary-300">
            Todo App
          </h1>
          <DarkModeToggle />
        </div>

        {/* Todo Creation Form */}
        <TodoForm onSubmit={addTodo} />

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            placeholder="Search todos..."
            aria-label="Search todos"
            className={cn(
              'w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm',
              'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700',
              'text-gray-900 dark:text-gray-100',
              'focus:ring-primary-500 focus:border-primary-500'
            )}
          />
        </div>

        {/* Todo List */}
        {isLoading && (
          <div className="text-center text-lg text-gray-600 dark:text-gray-400">Loading todos...</div>
        )}
        {error && (
          <div className="text-center text-red-600 dark:text-red-400">Error: {error}</div>
        )}
        {!isLoading && !error && todos.length === 0 && (
          <div className="text-center text-lg text-gray-600 dark:text-gray-400">
            No todos found. Try adding one!
          </div>
        )}
        {!isLoading && !error && todos.length > 0 && (
          <TodoList todos={todos} onUpdate={updateTodo} onDelete={deleteTodo} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
