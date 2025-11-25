import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Todo } from '@/lib/types';
import { useTodos } from '@/hooks/useTodos';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

interface TodoCardProps {
  todo: Todo;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo }) => {
  const { updateTodoMutation, deleteTodoMutation, getTodoDetailsQuery } = useTodos();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Lazy load details only when expanded
  const { data: detailedTodo, isLoading: isLoadingDetails } = getTodoDetailsQuery(todo.id, isExpanded);

  const displayTodo = detailedTodo || todo; // Use detailedTodo if loaded, otherwise initial todo

  const handleToggleComplete = async () => {
    try {
      await updateTodoMutation.mutateAsync({
        id: todo.id,
        completed: !todo.completed,
      });
      toast.success(`Todo "${todo.title}" marked ${todo.completed ? 'incomplete' : 'complete'}!`);
    } catch (error) {
      toast.error('Failed to update todo status.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodoMutation.mutateAsync(todo.id);
      toast.success(`Todo "${todo.title}" deleted!`);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete todo.');
    }
  };

  const getDueDateLabel = (dueDate: Date | undefined) => {
    if (!dueDate) return null;
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    if (isPast(dueDate, new Date())) return 'Overdue';
    return format(dueDate, 'MMM d, yyyy');
  };

  const dueDateLabel = getDueDateLabel(displayTodo.dueDate);

  return (
    <div
      className={clsx(
        'bg-card-light dark:bg-card-dark rounded-lg shadow-subtle p-4 mb-4 border border-gray-200 dark:border-gray-700',
        'hover:shadow-card-hover transition-all duration-200 ease-in-out',
        'flex flex-col',
        todo.completed && 'opacity-70 border-primary-300 dark:border-primary-700',
        todo.deletedAt && 'hidden' // Soft deleted items are hidden from the UI
      )}
      role="listitem"
      aria-labelledby={`todo-title-${todo.id}`}
      aria-describedby={`todo-description-${todo.id}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center flex-grow min-w-0">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
            aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            disabled={updateTodoMutation.isPending}
          />
          <h3
            id={`todo-title-${todo.id}`}
            className={clsx(
              'ml-3 text-lg font-semibold break-words',
              todo.completed && 'line-through text-secondary-light dark:text-secondary-dark'
            )}
          >
            {todo.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {dueDateLabel && (
            <span
              className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full',
                isPast(displayTodo.dueDate!, new Date()) && !todo.completed
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
              )}
              aria-label={`Due date: ${dueDateLabel}`}
            >
              {dueDateLabel}
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full text-secondary-light dark:text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-expanded={isExpanded}
            aria-controls={`todo-details-${todo.id}`}
            aria-label={isExpanded ? 'Collapse todo details' : 'Expand todo details'}
          >
            <svg
              className={clsx('w-5 h-5 transition-transform duration-200', isExpanded ? 'rotate-180' : 'rotate-0')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`Delete todo "${todo.title}"`}
            disabled={deleteTodoMutation.isPending}
          >
            {deleteTodoMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id={`todo-details-${todo.id}`} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-secondary-light dark:text-secondary-dark">
          {isLoadingDetails ? (
            <div className="flex justify-center py-2"><LoadingSpinner size="sm" /></div>
          ) : (
            <>
              {displayTodo.description && (
                <p className="mb-2" id={`todo-description-${todo.id}`}>
                  <span className="font-medium text-text-light dark:text-text-dark">Description:</span> {displayTodo.description}
                </p>
              )}
              <p>
                <span className="font-medium text-text-light dark:text-text-dark">Created:</span> {format(displayTodo.createdAt, 'MMM d, yyyy HH:mm')}
              </p>
              <p>
                <span className="font-medium text-text-light dark:text-text-dark">Last Updated:</span> {format(displayTodo.updatedAt, 'MMM d, yyyy HH:mm')}
              </p>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        description={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
      >
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`Confirm deletion of todo "${todo.title}"`}
            disabled={deleteTodoMutation.isPending}
          >
            {deleteTodoMutation.isPending ? <LoadingSpinner size="sm" color="white" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoCard;
