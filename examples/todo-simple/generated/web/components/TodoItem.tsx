'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Todo } from '@/types';
import { formatRelative, parseISO, isPast } from 'date-fns';
import { TrashIcon } from './Icons';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

// Lazy load TodoDetails component
const TodoDetails = lazy(() => import('./TodoDetails'));

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      setIsDeleting(true);
      await onDelete(todo.id);
      setIsDeleting(false);
    }
  };

  const formattedDueDate = todo.dueDate
    ? formatRelative(parseISO(todo.dueDate), new Date())
    : null;

  const isOverdue = todo.dueDate && isPast(parseISO(todo.dueDate)) && !todo.completed;

  return (
    <li
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-subtle transition-all duration-200',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'hover:shadow-card hover:scale-[1.01]',
        todo.completed && 'opacity-70 dark:opacity-60 line-through'
      )}
      aria-labelledby={`todo-title-${todo.id}`}
      aria-describedby={`todo-status-${todo.id} todo-dueDate-${todo.id}`}
    >
      <div className="flex items-center flex-grow mb-2 sm:mb-0">
        <input
          id={`checkbox-${todo.id}`}
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className={cn(
            'h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600',
            'focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
          )}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={`checkbox-${todo.id}`}
          id={`todo-title-${todo.id}`}
          className={cn(
            'ml-3 text-lg font-medium cursor-pointer',
            'text-gray-900 dark:text-gray-100',
            todo.completed && 'text-gray-500 dark:text-gray-400'
          )}
        >
          {todo.title}
        </label>
      </div>

      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
        {formattedDueDate && (
          <span
            id={`todo-dueDate-${todo.id}`}
            className={cn(
              'px-2 py-1 rounded-full text-xs font-semibold',
              isOverdue
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
            )}
            aria-label={`Due date: ${formattedDueDate}`}
          >
            Due: {formattedDueDate}
          </span>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 rounded-md text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900
                     hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors duration-200
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={`View details for "${todo.title}"`}
        >
          Details
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={cn(
            'p-2 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900',
            'hover:bg-red-100 dark:hover:bg-red-800 transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Delete "${todo.title}"`}
        >
          {isDeleting ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <TrashIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Lazy loaded modal for details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Todo Details">
        <Suspense fallback={<LoadingSpinner className="py-8" />}>
          <TodoDetails todo={todo} />
        </Suspense>
      </Modal>
    </li>
  );
}
