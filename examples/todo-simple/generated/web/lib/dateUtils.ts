import { format, parseISO, isFuture, isToday } from 'date-fns';

/**
 * Formats an ISO date string into a readable format.
 * @param isoDateString The date string in ISO format.
 * @param formatStr The format string (e.g., 'PPP', 'MM/dd/yyyy').
 * @returns Formatted date string or null if input is invalid.
 */
export function formatDate(isoDateString: string | null | undefined, formatStr: string = 'PPP'): string | null {
  if (!isoDateString) return null;
  try {
    return format(parseISO(isoDateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

/**
 * Validates if a given date string is today or in the future.
 * @param dateString The date string to validate (e.g., 'YYYY-MM-DD').
 * @returns True if the date is today or in the future, false otherwise.
 */
export function isValidDueDate(dateString: string | null | undefined): boolean {
  if (!dateString) return true; // No due date is valid

  try {
    const date = parseISO(dateString);
    // Check if it's a valid date object
    if (isNaN(date.getTime())) {
      return false;
    }
    return isToday(date) || isFuture(date);
  } catch (error) {
    console.error('Error validating due date:', error);
    return false;
  }
}
