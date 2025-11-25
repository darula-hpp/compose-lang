'use client';

import { useState, useEffect } from 'react';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
import FilterButtons from '@/components/FilterButtons';
import Pagination from '@/components/Pagination';
import ThemeToggle from '@/components/ThemeToggle';
import { useTodos } from '@/hooks/useTodos';
import { TodoFilter } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { DebounceInput } from 'react-debounce-input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Todo } from '@/lib/types';

const ITEMS_PER_PAGE = 50;

export default function Home() {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Use localStorage for caching completed todos for offline access
  // This is a simplified approach. A full offline solution would involve service workers.
  const [cachedCompletedTodos, setCachedCompletedTodos] = useLocalStorage<Todo[]>('completedTodosCache', []);

  const { data, isLoading, isError, error, isFetching } = useTodos({
    filter,
    page,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
  });

  const todos = data?.todos || [];
  const totalPages = data?.totalPages || 0;

  // Update localStorage cache when todos are fetched and completed
  useEffect(() => {
    if (todos.length > 0) {
      const completed = todos.filter(todo => todo.completed && !todo.deletedAt);
      setCachedCompletedTodos(completed);
    }
  }, [todos, setCachedCompletedTodos]);

  // If offline, we could potentially display cachedCompletedTodos here
  // For this demo, we'll just keep the cache updated.

  const handleFilterChange = (newFilter: TodoFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset page on filter change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset page on search change
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary-700 dark:text-primary-400">Todo App</h1>
        <ThemeToggle />
      </header>

      <main className="w-full max-w-3xl bg-card-light dark:bg-card-dark rounded-lg shadow-subtle p-6 space-y-6">
        <TodoForm />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <FilterButtons currentFilter={filter} onFilterChange={handleFilterChange} />
          <DebounceInput
            minLength={2}
            debounceTimeout={300}
            onChange={handleSearchChange}
            value={searchQuery}
            placeholder="Search todos..."
            aria-label="Search todos"
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark transition-colors duration-200"
          />
        </div>

        {isError && <ErrorDisplay message={error?.message || 'Failed to load todos.'} />}

        {(isLoading || isFetching) && <LoadingSpinner />}

        {!isLoading && !isFetching && todos.length === 0 && (
          <p className="text-center text-secondary-light dark:text-secondary-dark mt-8">
            No todos found for the current filter and search.
          </p>
        )}

        {!isLoading && !isError && todos.length > 0 && (
          <>
            <TodoList todos={todos} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
}
