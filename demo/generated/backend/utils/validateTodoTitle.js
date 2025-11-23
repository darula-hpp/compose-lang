/**
 * Validates a todo title based on specified criteria.
 *
 * @param {string} title The todo title to validate.
 * @returns {boolean} True if the title is valid (non-empty and under 200 characters), false otherwise.
 * @throws {TypeError} If the 'title' parameter is not a string.
 */
function validateTodoTitle(title) {
  // Ensure the input 'title' is a string for type correctness and to prevent unexpected errors.
  if (typeof title !== 'string') {
    throw new TypeError('The "title" parameter must be a string.');
  }

  // Trim whitespace from the title to accurately check for emptiness.
  const trimmedTitle = title.trim();

  // Check if the trimmed title is not empty.
  const isNonEmpty = trimmedTitle.length > 0;

  // Check if the original title's length is strictly less than 200 characters.
  // Note: We use the original title's length here as trimming might alter the character count,
  // but the requirement usually refers to the user-provided input length.
  const isUnder200Chars = title.length < 200;

  // Return true only if both conditions are met.
  return isNonEmpty && isUnder200Chars;
}