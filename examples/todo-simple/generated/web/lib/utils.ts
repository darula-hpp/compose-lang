import { v4 as uuidv4 } from 'uuid';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

/**
 * Generates a UUID (Universally Unique Identifier).
 * @returns A new UUID string.
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Formats a date into a human-readable string, with special labels for today/tomorrow/overdue.
 * @param date The date to format.
 * @returns A formatted date string or a special label.
 */
export function formatDueDate(date: Date | string | undefined): string | null {
  if (!date) return null;

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d, new Date())) return 'Overdue';
  return format(d, 'MMM d, yyyy');
}

// Utility for combining Tailwind classes
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
