import { Todo } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoList({ todos, onUpdate, onDelete }: TodoListProps) {
  return (
    <ul className="space-y-4 mt-8" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}
