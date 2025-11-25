import React, { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { toast } from 'react-hot-toast';
import { TodoSchema } from '@/lib/validation';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

const TodoForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState('');
  const { createTodoMutation } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation
    const validationResult = TodoSchema.safeParse({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description: description.trim() || undefined,
    });

    if (!validationResult.success) {
      validationResult.error.errors.forEach((err) => toast.error(err.message));
      return;
    }

    try {
      await createTodoMutation.mutateAsync({
        title: validationResult.data.title,
        dueDate: validationResult.data.dueDate,
        description: validationResult.data.description,
      });
      toast.success('Todo created successfully!');
      setTitle('');
      setDueDate('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create todo.');
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark transition-colors duration-200"
          required
          maxLength={200}
          aria-required="true"
          aria-label="Todo title"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this todo..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark transition-colors duration-200 resize-y"
          maxLength={500}
          aria-label="Todo description"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date (optional)
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={today}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark transition-colors duration-200"
          aria-label="Todo due date"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background-dark flex items-center justify-center"
        disabled={createTodoMutation.isPending}
        aria-label="Add new todo"
      >
        {createTodoMutation.isPending ? <LoadingSpinner size="sm" color="white" /> : 'Add Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
