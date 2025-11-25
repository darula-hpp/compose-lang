'use client';

import React, { useState } from 'react';
import { TodoInput } from '@/types';
import { format } from 'date-fns';
import { todoInputSchema } from '@/lib/validation';
import { PlusIcon } from './Icons';
import { cn } from '@/lib/utils';

interface TodoFormProps {
  onSubmit: (todo: TodoInput) => Promise<void>;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = todoInputSchema.parse({
        title: title.trim(),
        dueDate: dueDate || undefined,
      });

      await onSubmit({
        title: validatedData.title,
        dueDate: validatedData.dueDate,
      });
      setTitle('');
      setDueDate('');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const newErrors: { title?: string; dueDate?: string } = {};
        error.errors.forEach((err: any) => {
          if (err.path.includes('title')) newErrors.title = err.message;
          if (err.path.includes('dueDate')) newErrors.dueDate = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Failed to add todo:', error);
        setErrors({ title: 'An unexpected error occurred.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-card"
      aria-label="Add new todo"
    >
      <div className="flex-grow">
        <label htmlFor="todo-title" className="sr-only">
          Todo Title
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={cn(
            'w-full px-4 py-2 border rounded-md shadow-sm',
            'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-gray-100',
            'focus:ring-primary-500 focus:border-primary-500',
            errors.title && 'border-red-500'
          )}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          maxLength={200}
        />
        {errors.title && (
          <p id="title-error" className="text-red-500 text-sm mt-1">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="todo-dueDate" className="sr-only">
          Due Date (optional)
        </label>
        <input
          id="todo-dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={today}
          className={cn(
            'w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm',
            'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-gray-100',
            'focus:ring-primary-500 focus:border-primary-500',
            errors.dueDate && 'border-red-500'
          )}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
        />
        {errors.dueDate && (
          <p id="dueDate-error" className="text-red-500 text-sm mt-1">
            {errors.dueDate}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'flex items-center justify-center px-6 py-2 rounded-md font-semibold text-white',
          'bg-primary-600 hover:bg-primary-700 transition-colors duration-200 shadow-md',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed'
        )}
        aria-label="Add todo"
      >
        {isSubmitting ? (
          'Adding...'
        ) : (
          <>
            <PlusIcon className="h-5 w-5 mr-2" /> Add Todo
          </>
        )}
      </button>
    </form>
  );
}
