import { z } from 'zod';
import { isAfter, isToday, parseISO } from 'date-fns';

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' }),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((str) => (str ? parseISO(str) : null))
    .refine(
      (date) => {
        if (!date) return true; // Null/undefined is allowed
        return isToday(date) || isAfter(date, new Date());
      },
      { message: 'Due date must be today or in the future.' }
    ),
  completed: z.boolean().optional(),
});

export const updateTodoSchema = todoSchema.partial().extend({
  id: z.string().uuid({ message: 'Invalid Todo ID.' }),
});

export type CreateTodoInput = z.infer<typeof todoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
