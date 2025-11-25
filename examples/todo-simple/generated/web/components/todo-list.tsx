'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Todo, TodoStatus, PaginatedTodos } from '@/types';
import { TodoItem } from '@/components/todo-item';
import { Pagination } from '@/components/pagination';
import { FilterTabs } from '@/components/filter-tabs';
import { Input } from '@/components/ui/input';
import { DebounceInput } from 'react-debounce-input';
import { toast } from 'react-hot-toast';

interface TodoListProps {
  initialTodos: PaginatedTodos;
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [filter, setFilter] = React.useState<TodoStatus>('all');
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const { data, isLoading, isError, error } = useQuery<PaginatedTodos>({
    queryKey: ['todos', filter, page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', filter);
      params.append('page', page.toString());
      params.append('pageSize', '50'); // Fixed page size as per spec
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/todos?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch todos');
      }
      return response.json();
    },
    initialData: initialTodos, // Use initial data for first render
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  React.useEffect(() => {
    if (isError) {
      toast.error(`Failed to load todos: ${error?.message || 'Unknown error'}`);
    }
  }, [isError, error]);

  const handleFilterChange = (newFilter: TodoStatus) => {
    setFilter(newFilter);
    setPage(1); // Reset page when filter changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page when search changes
  };

  const todos = data?.todos || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <FilterTabs currentFilter={filter} onFilterChange={handleFilterChange} />
        <DebounceInput
          element={Input}
          minLength={2}
          debounceTimeout={300}
          onChange={handleSearchChange}
          value={search}
          placeholder="Search todos..."
          className="w-full sm:w-auto"
          aria-label="Search todos"
        />
      </div>

      {isLoading && (
        <div className="text-center text-primary-600 dark:text-primary-300">
          Loading todos...
        </div>
      )}

      {!isLoading && todos.length === 0 && (
        <div className="text-center text-primary-500 dark:text-primary-400">
          No todos found for the current filter.
        </div>
      )}

      <div className="grid gap-4">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
