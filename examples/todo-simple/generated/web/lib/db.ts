import { promises as fs } from 'fs';
import path from 'path';
import { Todo } from '@/types';
import { isFuture, isToday, parseISO } from 'date-fns';

const DB_FILE = path.join(process.cwd(), 'data', 'todos.json');

// Ensure the data directory exists
async function ensureDbFileExists() {
  const dir = path.dirname(DB_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    await fs.writeFile(DB_FILE, JSON.stringify([]), 'utf8');
  }
}

// Read todos from the file
async function readTodos(): Promise<Todo[]> {
  await ensureDbFileExists();
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Write todos to the file
async function writeTodos(todos: Todo[]): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

interface GetTodosOptions {
  filter?: 'all' | 'active' | 'completed' | null;
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export async function getTodos({
  filter = 'all',
  page = 1,
  limit = 50,
  searchQuery = '',
}: GetTodosOptions): Promise<{ todos: Todo[]; totalPages: number }> {
  let allTodos = await readTodos();

  // Filter out soft-deleted todos
  allTodos = allTodos.filter((todo) => todo.deletedAt === null);

  // Apply search query
  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    allTodos = allTodos.filter((todo) =>
      todo.title.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // Apply status filter
  let filteredTodos = allTodos;
  if (filter === 'active') {
    filteredTodos = allTodos.filter((todo) => !todo.completed);
  } else if (filter === 'completed') {
    filteredTodos = allTodos.filter((todo) => todo.completed);
  }

  // Sort by createdAt descending (newest first)
  filteredTodos.sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());

  // Pagination
  const totalItems = filteredTodos.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

  return { todos: paginatedTodos, totalPages };
}

export async function addTodo(newTodo: Todo): Promise<Todo> {
  const todos = await readTodos();
  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex((todo) => todo.id === id && todo.deletedAt === null);

  if (index === -1) {
    return null;
  }

  const updatedTodo = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Ensure dueDate validation on update if it's being changed
  if (updates.dueDate) {
    const dueDate = parseISO(updates.dueDate);
    if (!isToday(dueDate) && !isFuture(dueDate)) {
      throw new Error('Due date must be today or in the future.');
    }
  }

  todos[index] = updatedTodo;
  await writeTodos(todos);
  return updatedTodo;
}

export async function deleteTodoSoft(id: string): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex((todo) => todo.id === id && todo.deletedAt === null);

  if (index === -1) {
    return null;
  }

  const deletedTodo = {
    ...todos[index],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos[index] = deletedTodo;
  await writeTodos(todos);
  return deletedTodo;
}
