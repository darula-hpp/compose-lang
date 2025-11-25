import { NextResponse } from 'next/server';
import { getTodos, addTodo, updateTodo, deleteTodoSoft } from '@/lib/db';
import { todoSchema, updateTodoSchema } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';
import { isFuture, isToday, parseISO } from 'date-fns';

// Helper to handle Zod validation errors
const handleValidationError = (error: any) => {
  return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
};

// GET /api/todos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') as 'all' | 'active' | 'completed' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const searchQuery = searchParams.get('searchQuery') || '';

    const { todos, totalPages } = await getTodos({ filter, page, limit, searchQuery });
    return NextResponse.json({ todos, totalPages });
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ message: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST /api/todos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = todoSchema.parse(body);

    // Backend specific due date validation
    if (parsedBody.dueDate) {
      const dueDate = parseISO(parsedBody.dueDate);
      if (!isToday(dueDate) && !isFuture(dueDate)) {
        return NextResponse.json(
          { message: 'Validation Error', errors: [{ path: ['dueDate'], message: 'Due date must be today or in the future.' }] },
          { status: 400 }
        );
      }
    }

    const newTodo = {
      id: uuidv4(),
      title: parsedBody.title.trim(),
      completed: false,
      dueDate: parsedBody.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      userId: 'user-123', // Hardcoded for this example as user auth is not in scope
    };

    const addedTodo = await addTodo(newTodo);
    return NextResponse.json(addedTodo, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return handleValidationError(error);
    }
    console.error('Failed to create todo:', error);
    return NextResponse.json({ message: 'Failed to create todo' }, { status: 500 });
  }
}

// PUT /api/todos/[id] (for marking complete/incomplete)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Todo ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateTodoSchema.parse(body);

    const updatedTodo = await updateTodo(id, parsedBody);
    if (!updatedTodo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTodo);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return handleValidationError(error);
    }
    console.error('Failed to update todo:', error);
    return NextResponse.json({ message: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] (soft delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Todo ID is required' }, { status: 400 });
    }

    const deletedTodo = await deleteTodoSoft(id);
    if (!deletedTodo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo soft-deleted successfully' });
  } catch (error) {
    console.error('Failed to soft-delete todo:', error);
    return NextResponse.json({ message: 'Failed to soft-delete todo' }, { status: 500 });
  }
}
