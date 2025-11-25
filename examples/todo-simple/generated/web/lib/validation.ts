import { z } from 'zod';
import { isFuture, isToday, parseISO } from 'date-fns';

// Helper function to validate date strings or Date objects
const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string') {
    return parseISO(arg);
  }
  return arg;
}, z.date().optional().nullable());

export const TodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' }),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional()
    .nullable()
    .transform(e => e === '' ? undefined : e), // Convert empty string to undefined
  dueDate: dateSchema
    .refine((date) => {
      if (!date) return true; // Optional, so no validation if not provided
      return isFuture(date) || isToday(date);
    }, {
      message: 'Due date must be today or in the future.',
    })
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
});

export const UpdateTodoSchema = TodoSchema.partial().extend({
  id: z.string().uuid({ message: 'Invalid Todo ID format.' }),
});

export const CreateTodoSchema = TodoSchema;

export const GetTodosQuerySchema = z.object({
  status: z.enum(['all', 'active', 'completed']).default('all').optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1').optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1)).default('50').optional(),
  search: z.string().trim().optional(),
});
