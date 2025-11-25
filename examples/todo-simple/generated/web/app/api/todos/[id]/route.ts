import { NextResponse } from 'next/server';
import { updateTodo, deleteTodoSoft } from '@/lib/db';
import { updateTodoSchema } from '@/lib/validation';
import { isFuture, isToday, parseISO } from 'date-fns';

// Helper to handle Zod validation errors
const handleValidationError = (error: any) => {
  return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
};

// PUT /api/todos/[id] (for marking complete/incomplete or updating title/dueDate)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const parsedBody = updateTodoSchema.parse(body);

    // Backend specific due date validation if dueDate is being updated
    if (parsedBody.dueDate) {
      const dueDate = parseISO(parsedBody.dueDate);
      if (!isToday(dueDate) && !isFuture(dueDate)) {
        return NextResponse.json(
          { message: 'Validation Error', errors: [{ path: ['dueDate'], message: 'Due date must be today or in the future.' }] },
          { status: 400 }
        );
      }
    }

    const updatedTodo = await updateTodo(id, parsedBody);
    if (!updatedTodo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTodo);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return handleValidationError(error);
    }
    console.error(`Failed to update todo ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] (soft delete)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const deletedTodo = await deleteTodoSoft(id);
    if (!deletedTodo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo soft-deleted successfully' });
  } catch (error) {
    console.error(`Failed to soft-delete todo ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to soft-delete todo' }, { status: 500 });
  }
}
