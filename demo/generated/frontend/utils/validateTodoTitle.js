/**
 * Validates a todo title based on specific criteria.
 *
 * @param {string} title The todo title to validate.
 * @returns {boolean} True if the title is valid, false otherwise.
 * @throws {Error} If the title parameter is not a string.
 */
function validateTodoTitle(title) {
  // Ensure the input is a string for type correctness and to prevent unexpected errors.
  if (typeof title !== 'string') {
    throw new Error('Invalid input: title must be a string.');
  }

  // Trim whitespace from the title to ensure that titles consisting only of spaces
  // are considered empty.
  const trimmedTitle = title.trim();

  // Rule 1: Check if the title is non-empty after trimming.
  const isNonEmpty = trimmedTitle.length > 0;

  // Rule 2: Check if the title is under 200 characters.
  // Note: The original (untrimmed) title length is used here, as trimming
  // should not affect the character count for this specific rule.
  const isUnder200Chars = title.length < 200;

  // A title is valid if it meets both criteria.
  return isNonEmpty && isUnder200Chars;
}