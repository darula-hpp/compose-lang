import React from 'react';
import { Todo } from '@/lib/types';
import TodoCard from './TodoCard';

interface TodoListProps {
  todos: Todo[];
}

const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  return (
    <div className="space-y-4" role="list" aria-label="List of todos">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;
