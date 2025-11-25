export type TodoFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt: string | null; // ISO string for soft delete
  userId: string; // For future multi-user support, currently hardcoded
}

export interface TodoInput {
  title: string;
  dueDate?: string | null; // Optional for creation
}
