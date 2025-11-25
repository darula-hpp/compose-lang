import { z } from 'zod';
import { isFuture, isToday, parseISO } from 'date-fns';

// Custom validation for due date
const dueDateValidation = z.string().datetime({ offset: true }).optional().nullable().refine(
  (dateString) => {
    if (!dateString) return true; // Null or undefined due date is allowed
    const date = parseISO(dateString);
    // Check if it's a valid date object and is today or in the future
    return !isNaN(date.getTime()) && (isToday(date) || isFuture(date));
  },
  {
    message: 'Due date must be today or in the future.',
  }
);

// Schema for creating a new todo (frontend input)
export const todoInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' }),
  dueDate: z.string().optional().nullable().transform(e => e === "" ? null : e), // Convert empty string to null
});

// Schema for API POST request (backend validation)
export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' }),
  dueDate: dueDateValidation,
});

// Schema for updating a todo (API PUT request)
export const updateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' })
    .optional(),
  completed: z.boolean().optional(),
  dueDate: dueDateValidation.optional(),
});

// Type for frontend form input
export type TodoInput = z.infer<typeof todoInputSchema>;
