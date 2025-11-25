import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo, CreateTodoPayload, UpdateTodoPayload, TodoFilter, PaginatedTodos } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface UseTodosOptions {
  filter?: TodoFilter;
  page?: number;
  limit?: number;
  search?: string;
}

export const useTodos = ({ filter = 'all', page = 1, limit = 50, search = '' }: UseTodosOptions = {}) => {
  const queryClient = useQueryClient();

  // Query for fetching todos
  const todosQuery = useQuery<PaginatedTodos, Error>({
    queryKey: ['todos', { filter, page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);
      return api.get<PaginatedTodos>(`/api/todos?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Keep old data while fetching new page/filter
  });

  // Query for fetching a single todo's details (lazy load)
  const getTodoDetailsQuery = (id: string, enabled: boolean) => useQuery<Todo, Error>({
    queryKey: ['todo', id],
    queryFn: () => api.get<Todo>(`/api/todos/${id}`),
    enabled: enabled, // Only fetch when enabled (e.g., card is expanded)
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Mutation for creating a todo
  const createTodoMutation = useMutation<Todo, Error, CreateTodoPayload>({
    mutationFn: (newTodo) => api.post<Todo>('/api/todos', newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] }); // Invalidate all todo lists
    },
    onError: (error) => {
      toast.error(`Error creating todo: ${error.message}`);
    },
  });

  // Mutation for updating a todo
  const updateTodoMutation = useMutation<Todo, Error, UpdateTodoPayload>({
    mutationFn: ({ id, ...updates }) => api.put<Todo>(`/api/todos/${id}`, updates),
    onMutate: async (updatedTodo) => {
      // Cancel any outgoing refetches for the todos list
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      await queryClient.cancelQueries({ queryKey: ['todo', updatedTodo.id] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<PaginatedTodos>(['todos', { filter, page, limit, search }]);
      const previousTodoDetail = queryClient.getQueryData<Todo>(['todo', updatedTodo.id]);

      // Optimistically update the todos list
      queryClient.setQueryData<PaginatedTodos>(['todos', { filter, page, limit, search }], (old) => {
        if (!old) return old;
        return {
          ...old,
          todos: old.todos.map((todo) =>
            todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
          ),
        };
      });

      // Optimistically update the single todo detail
      queryClient.setQueryData<Todo>(['todo', updatedTodo.id], (old) => {
        if (!old) return old;
        return { ...old, ...updatedTodo };
      });

      return { previousTodos, previousTodoDetail };
    },
    onError: (error, updatedTodo, context) => {
      toast.error(`Error updating todo: ${error.message}`);
      // Rollback to the previous value on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', { filter, page, limit, search }], context.previousTodos);
      }
      if (context?.previousTodoDetail) {
        queryClient.setQueryData(['todo', updatedTodo.id], context.previousTodoDetail);
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo', variables.id] });
    },
  });

  // Mutation for deleting a todo (soft delete)
  const deleteTodoMutation = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/api/todos/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      await queryClient.cancelQueries({ queryKey: ['todo', id] });

      const previousTodos = queryClient.getQueryData<PaginatedTodos>(['todos', { filter, page, limit, search }]);
      const previousTodoDetail = queryClient.getQueryData<Todo>(['todo', id]);

      queryClient.setQueryData<PaginatedTodos>(['todos', { filter, page, limit, search }], (old) => {
        if (!old) return old;
        return {
          ...old,
          todos: old.todos.map((todo) =>
            todo.id === id ? { ...todo, deletedAt: new Date().toISOString() } : todo
          ),
        };
      });

      queryClient.setQueryData<Todo>(['todo', id], (old) => {
        if (!old) return old;
        return { ...old, deletedAt: new Date().toISOString() };
      });

      return { previousTodos, previousTodoDetail };
    },
    onError: (error, id, context) => {
      toast.error(`Error deleting todo: ${error.message}`);
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', { filter, page, limit, search }], context.previousTodos);
      }
      if (context?.previousTodoDetail) {
        queryClient.setQueryData(['todo', id], context.previousTodoDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return {
    todosQuery,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    getTodoDetailsQuery,
    ...todosQuery, // Spread all properties from todosQuery for convenience
  };
};
