export type TodoStatus = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PaginatedTodos {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
