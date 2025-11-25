'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTodoInput, todoSchema } from '@/validation/todo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for notifications

interface TodoFormProps {
  initialData?: CreateTodoInput;
  onSuccess?: () => void;
}

export function TodoForm({ initialData, onSuccess }: TodoFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [dueDate, setDueDate] = React.useState(
    initialData?.dueDate ? format(initialData.dueDate, 'yyyy-MM-dd') : ''
  );
  const [errors, setErrors] = React.useState<{
    title?: string;
    dueDate?: string;
  }>({});

  const createTodoMutation = useMutation({
    mutationFn: async (newTodo: CreateTodoInput) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create todo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
      setDueDate('');
      setErrors({});
      toast.success('Todo created successfully!');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Error creating todo: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    const dataToValidate = {
      title,
      dueDate: dueDate || null,
    };

    const validationResult = todoSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        dueDate: fieldErrors.dueDate?.[0],
      });
      toast.error('Please correct the form errors.');
      return;
    }

    createTodoMutation.mutate(validationResult.data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Todo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="title"
              type="text"
              placeholder="Todo title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Todo title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-red-500 text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>
          <div>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
            />
            {errors.dueDate && (
              <p id="dueDate-error" className="text-red-500 text-sm mt-1">
                {errors.dueDate}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createTodoMutation.isPending}
            aria-live="polite"
          >
            {createTodoMutation.isPending ? 'Adding...' : 'Add Todo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
