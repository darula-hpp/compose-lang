const express = require('express');
const router = express.Router();

/**
 * DELETE /api/todos/:id
 *
 * Deletes a todo item by its ID.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
router.delete('/todos/:id', async (req, res) => {
  try {
    // 1. Input Validation: Validate the 'id' parameter from the URL.
    // Ensure the ID is present and is a valid positive integer.
    const todoId = parseInt(req.params.id, 10);

    if (isNaN(todoId) || todoId <= 0) {
      // Respond with a 400 Bad Request if the ID is invalid.
      return res.status(400).json({ message: 'Invalid todo ID. ID must be a positive integer.' });
    }

    // 2. Business Logic: Attempt to delete the todo item from the database.
    // In a real application, this would involve a database call, e.g.:
    // const deletedTodo = await TodoModel.findByIdAndDelete(todoId);
    //
    // For demonstration, let's simulate a database operation.
    // Assume `null` means not found, `true` means deleted successfully.
    let isDeleted = null; // Default to not found

    // --- Start Mock Database Interaction ---
    // Replace this block with your actual database deletion logic.
    // Example with a hypothetical `TodoService`:
    // isDeleted = await TodoService.deleteTodo(todoId);
    //
    // For this example, we'll simulate a 404 for ID 999 and success for others.
    if (todoId === 999) {
      isDeleted = null; // Simulate todo not found
    } else {
      isDeleted = true; // Simulate successful deletion
    }
    // --- End Mock Database Interaction ---

    // 3. Handle deletion result
    if (isDeleted === null) {
      // If `isDeleted` is null, it means the todo with the given ID was not found.
      return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
    } else if (isDeleted) {
      // If `isDeleted` is true, the todo was successfully deleted.
      // Send a 204 No Content response, which is standard for successful DELETE operations
      // where no content is returned.
      return res.status(204).send();
    } else {
      // This case handles scenarios where the deletion operation might fail
      // for reasons other than 'not found' (e.g., database error, permissions).
      // Your actual database service should return a more specific error or throw.
      console.warn(`Deletion of todo ID ${todoId} returned an unexpected result.`);
      return res.status(500).json({ message: 'Failed to delete todo due to an unexpected issue.' });
    }

  } catch (error) {
    // 4. Error Handling: Catch any unexpected errors that occur during the process.
    // Log the error for debugging purposes.
    console.error(`Error deleting todo with ID ${req.params.id}:`, error);
    // Respond with a 500 Internal Server Error.
    return res.status(500).json({ message: 'An unexpected error occurred while deleting the todo.' });
  }
});

module.exports = router;