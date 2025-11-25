import { NextResponse } from 'next/server';
import { getTodoByIdFromDB, updateTodoInDB, softDeleteTodoInDB } from '@/lib/db';
import { UpdateTodoSchema } from '@/lib/validation';

// GET /api/todos/[id] - Fetch a single todo by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const todo = await getTodoByIdFromDB(id);

    if (!todo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo, { status: 200 });
  } catch (error: any) {
    console.error(`API GET /api/todos/${params.id} error:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/todos/[id] - Update a todo by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate incoming updates
    const parsedBody = UpdateTodoSchema.safeParse({ ...body, id }); // Include ID for schema validation if needed

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.errors }, { status: 400 });
    }

    const updates = parsedBody.data;

    const updatedTodo = await updateTodoInDB(id, updates);

    if (!updatedTodo) {
      return NextResponse.json({ message: 'Todo not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error: any) {
    console.error(`API PUT /api/todos/${params.id} error:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] - Soft delete a todo by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const deletedTodo = await softDeleteTodoInDB(id);

    if (!deletedTodo) {
      return NextResponse.json({ message: 'Todo not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo soft deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`API DELETE /api/todos/${params.id} error:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server