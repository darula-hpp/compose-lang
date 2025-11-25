import { NextResponse } from 'next/server';
import { getTodosFromDB, createTodoInDB } from '@/lib/db';
import { CreateTodoSchema, GetTodosQuerySchema } from '@/lib/validation';
import { Todo, PaginatedTodos } from '@/lib/types';

// GET /api/todos - Fetch all/filtered/paginated todos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const parsedQuery = GetTodosQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return NextResponse.json({ errors: parsedQuery.error.errors }, { status: 400 });
    }

    const { status, page, limit, search } = parsedQuery.data;

    let todos = await getTodosFromDB();

    // Apply search filter
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      todos = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(lowercasedSearch) ||
          (todo.description && todo.description.toLowerCase().includes(lowercasedSearch))
      );
    }

    // Apply status filter
    if (status === 'active') {
      todos = todos.filter((todo) => !todo.completed);
    } else if (status === 'completed') {
      todos = todos.filter((todo) => todo.completed);
    }

    // Sort by createdAt descending (newest first)
    todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const totalItems = todos.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTodos = todos.slice(startIndex, endIndex);

    const response: PaginatedTodos = {
      todos: paginatedTodos,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('API GET /api/todos error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Frontend validation is done, but backend validation is crucial
    const parsedBody = CreateTodoSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.errors }, { status: 400 });
    }

    const newTodoData = parsedBody.data;

    const createdTodo = await createTodoInDB(newTodoData);

    return NextResponse.json(createdTodo, { status: 201 });
  } catch (error: any) {
    console.error('API POST /api/todos error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
