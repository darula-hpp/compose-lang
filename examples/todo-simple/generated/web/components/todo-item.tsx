'use client';

import * as React from 'react';
import { format, isPast } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Todo } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UpdateTodoInput, updateTodoSchema } from '@/validation/todo';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(todo.title);
  const [editDueDate, setEditDueDate] = React.useState(
    todo.dueDate ? format(todo.dueDate, 'yyyy-MM-dd') : ''
  );
  const [errors, setErrors] = React.useState<{
    title?: string;
    dueDate?: string;
  }>({});

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedFields: UpdateTodoInput) => {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update todo');
      }
      return response.json();
    },
    onMutate: async (newTodoData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old: any) => {
        if (!old) return old;
        const updatedTodos = old.todos.map((t: Todo) =>
          t.id === todo.id ? { ...t, ...newTodoData } : t
        );
        return { ...old, todos: updatedTodos };
      });

      // Cache completed todos in localStorage
      if (newTodoData.completed !== undefined) {
        const cachedCompleted = JSON.parse(localStorage.getItem('completedTodos') || '[]');
        if (newTodoData.completed) {
          localStorage.setItem('completedTodos', JSON.stringify([...cachedCompleted, todo.id]));
        } else {
          localStorage.setItem('completedTodos', JSON.stringify(cachedCompleted.filter((id: string) => id !== todo.id)));
        }
      }

      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsEditing(false);
      setErrors({});
      toast.success('Todo updated successfully!');
    },
    onError: (error: Error, newTodoData, context) => {
      // Rollback on error
      queryClient.setQueryData(['todos'], context?.previousTodos);
      toast.error(`Error updating todo: ${error.message}`);
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete todo');
      }
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update for deletion
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old: any) => {
        if (!old) return old;
        return { ...old, todos: old.todos.filter((t: Todo) => t.id !== todo.id) };
      });

      // Remove from localStorage cache if present
      const cachedCompleted = JSON.parse(localStorage.getItem('completedTodos') || '[]');
      localStorage.setItem('completedTodos', JSON.stringify(cachedCompleted.filter((id: string) => id !== todo.id)));

      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted successfully!');
    },
    onError: (error: Error, variables, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
      toast.error(`Error deleting todo: ${error.message}`);
    },
  });

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({ id: todo.id, completed: !todo.completed });
  };

  const handleSaveEdit = () => {
    setErrors({});
    const dataToValidate = {
      id: todo.id,
      title: editTitle,
      dueDate: editDueDate || null,
    };

    const validationResult = updateTodoSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        dueDate: fieldErrors.dueDate?.[0],
      });
      toast.error('Please correct the form errors.');
      return;
    }

    updateTodoMutation.mutate(validationResult.data);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDueDate(todo.dueDate ? format(todo.dueDate, 'yyyy-MM-dd') : '');
    setErrors({});
  };

  const isOverdue = todo.dueDate && isPast(todo.dueDate) && !todo.completed;

  return (
    <>
      <Card
        className={cn(
          'flex items-center justify-between p-4 transition-all duration-200 ease-in-out',
          'hover:shadow-md dark:hover:bg-primary-800',
          todo.completed && 'opacity-70',
          isOverdue && 'border-red-400 dark:border-red-600'
        )}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsEditing(true);
        }}
        aria-label={`Todo: ${todo.title}, ${todo.completed ? 'completed' : 'active'}${todo.dueDate ? `, due ${format(todo.dueDate, 'PPP')}` : ''}`}
      >
        <div className="flex items-center space-x-3 flex-grow">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            disabled={updateTodoMutation.isPending || deleteTodoMutation.isPending}
            aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <div
            className="flex-grow cursor-pointer"
            onClick={() => setIsEditing(true)}
            aria-expanded={isEditing}
            role="button"
            tabIndex={0}
          >
            <p
              className={cn(
                'text-lg font-medium',
                todo.completed && 'line-through text-primary-500 dark:text-primary-400',
                isOverdue && 'text-red-600 dark:text-red-400'
              )}
            >
              {todo.title}
            </p>
            {todo.dueDate && (
              <p
                className={cn(
                  'text-sm text-primary-500 dark:text-primary-400',
                  isOverdue && 'text-red-500 dark:text-red-300'
                )}
              >
                Due: {format(todo.dueDate, 'PPP')}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={updateTodoMutation.isPending || deleteTodoMutation.isPending}
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteTodoMutation.mutate()}
            disabled={updateTodoMutation.isPending || deleteTodoMutation.isPending}
            aria-label={`Delete "${todo.title}"`}
          >
            {deleteTodoMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Card>

      {/* Lazy-loaded Dialog for editing */}
      {isEditing && (
        <Dialog
          isOpen={isEditing}
          onClose={handleCancelEdit}
          title={`Edit Todo: "${todo.title}"`}
          description="Make changes to your todo item here."
        >
          <div className="space-y-4">
            <div>
              <Input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Todo title"
                aria-label="Edit todo title"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'edit-title-error' : undefined}
              />
              {errors.title && (
                <p id="edit-title-error" className="text-red-500 text-sm mt-1">
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <Input
                id="edit-dueDate"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                aria-label="Edit due date"
                aria-invalid={!!errors.dueDate}
                aria-describedby={errors.dueDate ? 'edit-dueDate-error' : undefined}
              />
              {errors.dueDate && (
                <p id="edit-dueDate-error" className="text-red-500 text-sm mt-1">
                  {errors.dueDate}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateTodoMutation.isPending}
                aria-live="polite"
              >
                {updateTodoMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
