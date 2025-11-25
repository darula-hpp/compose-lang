import React from 'react';
import { Todo } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TodoDetailsProps {
  todo: Todo;
}

const TodoDetails: React.FC<TodoDetailsProps> = ({ todo }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Title:</h3>
        <p className="text-gray-700 dark:text-gray-300">{todo.title}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Status:</h3>
        <p
          className={cn(
            'font-medium',
            todo.completed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          )}
        >
          {todo.completed ? 'Completed' : 'Active'}
        </p>
      </div>
      {todo.dueDate && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Due Date:</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {format(new Date(todo.dueDate), 'PPP')} ({format(new Date(todo.dueDate), 'p')})
          </p>
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Created At:</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {format(new Date(todo.createdAt), 'PPP')} ({format(new Date(todo.createdAt), 'p')})
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Last Updated:</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {format(new Date(todo.updatedAt), 'PPP')} ({format(new Date(todo.updatedAt), 'p')})
        </p>
      </div>
    </div>
  );
};

export default TodoDetails;
