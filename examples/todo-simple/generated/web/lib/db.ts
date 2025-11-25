import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './types';

// Path to the JSON file that simulates our database
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'todos.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('Failed to create data directory:', error);
      throw error;
    }
  }
}

// Read all todos from the JSON file
async function readTodos(): Promise<Todo[]> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data) as Todo[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File does not exist, return empty array
      return [];
    }
    console.error('Error reading todos from file:', error);
    throw new Error('Failed to read todos from database.');
  }
}

// Write all todos to the JSON file
async function writeTodos(todos: Todo[]): Promise<void> {
  await ensureDataDirectory();
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(todos, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing todos to file:', error);
    throw new Error('Failed to write todos to database.');
  }
}

// --- CRUD Operations ---

export async function getTodosFromDB(): Promise<Todo[]> {
  const todos = await readTodos();
  // Filter out soft-deleted items by default for most queries
  return todos.filter(todo => !todo.deletedAt);
}

export async function getTodoByIdFromDB(id: string): Promise<Todo | null> {
  const todos = await readTodos();
  const todo = todos.find(t => t.id === id && !t.deletedAt);
  return todo || null;
}

export async function createTodoInDB(newTodoData: Omit<Todo, 'id' | 'completed' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Todo> {
  const todos = await readTodos();
  const now = new Date().toISOString();
  const todo: Todo = {
    id: uuidv4(),
    title: newTodoData.title,
    description: newTodoData.description || undefined,
    completed: false,
    dueDate: newTodoData.dueDate ? new Date(newTodoData.dueDate) : undefined,
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
  };
  todos.push(todo);
  await writeTodos(todos);
  return todo;
}

export async function updateTodoInDB(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'deletedAt'>>): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex(t => t.id === id && !t.deletedAt);

  if (index === -1) {
    return null;
  }

  const updatedTodo: Todo = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    // Ensure dueDate is correctly handled if it's a string from API
    dueDate: updates.dueDate ? new Date(updates.dueDate) : todos[index].dueDate,
  };

  todos[index] = updatedTodo;
  await writeTodos(todos);
  return updatedTodo;
}

export async function softDeleteTodoInDB(id: string): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex(t => t.id === id && !t.deletedAt);

  if (index === -1) {
    return null;
  }

  const deletedTodo: Todo = {
    ...todos[index],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos[index] = deletedTodo;
  await writeTodos(todos);
  return deletedTodo;
}

// Note on indexing: For a real database (e.g., PostgreSQL, MongoDB),
// you would add indexes on fields like `userId` (if applicable, not in this spec),
// `dueDate`, and `deletedAt` for efficient querying and filtering.
// For this file-based simulation, indexing is not directly applicable.
