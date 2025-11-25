export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date; // Stored as Date object in DB simulation, but can be string from API
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt?: string; // ISO string for soft delete
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  dueDate?: Date; // Can be Date object or ISO string
}

export interface UpdateTodoPayload {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date | null; // Null to clear due date
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface PaginatedTodos {
  todos: Todo[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
