import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoInput, TodoFilter } from '@/types';
import { api } from '@/lib/api';
import localforage from 'localforage';

interface UseTodosOptions {
  filter: TodoFilter;
  page: number;
  limit: number;
  searchQuery: string;
}

const COMPLETED_TODOS_CACHE_KEY = 'completedTodosCache';

export function useTodos({ filter, page, limit, searchQuery }: UseTodosOptions) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filter !== 'all') {
        params.append('filter', filter);
      }
      if (searchQuery) {
        params.append('searchQuery', searchQuery);
      }

      const response = await api.get<{ todos: Todo[]; totalPages: number }>(`/api/todos?${params.toString()}`);
      setTodos(response.todos);
      setTotalPages(response.totalPages);

      // Cache completed todos
      const completed = response.todos.filter(t => t.completed);
      if (completed.length > 0) {
        await localforage.setItem(COMPLETED_TODOS_CACHE_KEY, completed);
      }
    } catch (err: any) {
      console.error('Failed to fetch todos:', err);
      setError(err.message || 'Failed to load todos.');
      // Try to load from cache if fetching fails for completed todos
      if (filter === 'completed') {
        const cachedCompleted = await localforage.getItem<Todo[]>(COMPLETED_TODOS_CACHE_KEY);
        if (cachedCompleted) {
          setTodos(cachedCompleted);
          setError('Failed to load latest todos, showing cached completed todos.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, limit, searchQuery]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (todoInput: TodoInput) => {
    try {
      const newTodo = await api.post<Todo>('/api/todos', todoInput);
      setTodos((prev) => (filter === 'completed' ? prev : [newTodo, ...prev])); // Only add if not on completed filter
      // Re-fetch to ensure correct pagination/filtering if needed, or just update state
      // For simplicity and immediate feedback, we'll update state directly if filter allows.
      // A full re-fetch might be better for complex filtering/sorting.
      fetchTodos();
    } catch (err: any) {
      console.error('Failed to add todo:', err);
      throw new Error(err.message || 'Failed to add todo.');
    }
  }, [filter, fetchTodos]);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await api.put<Todo>(`/api/todos/${id}`, updates);
      setTodos((prev) =>
        prev
          .map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
          .filter((todo) => {
            // If filter is 'active' and todo becomes completed, remove it
            if (filter === 'active' && todo.id === id && todo.completed) return false;
            // If filter is 'completed' and todo becomes active, remove it
            if (filter === 'completed' && todo.id === id && !todo.completed) return false;
            return true;
          })
      );
      // Update cache for completed todos
      if (updatedTodo.completed) {
        const cachedCompleted = (await localforage.getItem<Todo[]>(COMPLETED_TODOS_CACHE_KEY)) || [];
        const existingIndex = cachedCompleted.findIndex(t => t.id === updatedTodo.id);
        if (existingIndex > -1) {
          cachedCompleted[existingIndex] = updatedTodo;
        } else {
          cachedCompleted.push(updatedTodo);
        }
        await localforage.setItem(COMPLETED_TODOS_CACHE_KEY, cachedCompleted);
      } else {
        // If it's no longer completed, remove from cache
        const cachedCompleted = (await localforage.getItem<Todo[]>(COMPLETED_TODOS_CACHE_KEY)) || [];
        await localforage.setItem(COMPLETED_TODOS_CACHE_KEY, cachedCompleted.filter(t => t.id !== updatedTodo.id));
      }
    } catch (err: any) {
      console.error('Failed to update todo:', err);
      throw new Error(err.message || 'Failed to update todo.');
    }
  }, [filter]);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      // Remove from completed cache if it was there
      const cachedCompleted = (await localforage.getItem<Todo[]>(COMPLETED_TODOS_CACHE_KEY)) || [];
      await localforage.setItem(COMPLETED_TODOS_CACHE_KEY, cachedCompleted.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Failed to delete todo:', err);
      throw new Error(err.message || 'Failed to delete todo.');
    }
  }, []);

  return {
    todos,
    isLoading,
    error,
    totalPages,
    addTodo,
    updateTodo,
    deleteTodo,
    fetchTodos, // Expose fetchTodos for manual refresh if needed
  };
}
