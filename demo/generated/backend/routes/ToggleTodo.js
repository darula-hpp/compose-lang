const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes. In a real application, this would interact with a database.
const todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build an Express API', completed: true },
  { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * @route PATCH /api/todos/:todoId
 * @description Toggle todo completed status
 * @param {string} todoId - The ID of the todo item to toggle
 * @returns {object} 200 - The updated todo item
 * @returns {object} 400 - If todoId is invalid
 * @returns {object} 404 - If todo item is not found
 * @returns {object} 500 - Server error
 */
router.patch('/todos/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;

    // 1. Input Validation for todoId
    // Ensure todoId is a valid integer. Adjust validation if using UUIDs or other formats.
    const id = parseInt(todoId, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid todo ID provided. ID must be a positive integer.' });
    }

    // 2. Find the todo item
    // In a real application, this would be a database query (e.g., `await Todo.findById(id)`).
    const todoIndex = todos.findIndex(t => t.id === id);

    // If todo not found, return 404
    if (todoIndex === -1) {
      return res.status(404).json({ message: `Todo with ID ${id} not found.` });
    }

    // 3. Toggle the 'completed' status
    const todoToUpdate = todos[todoIndex];
    todoToUpdate.completed = !todoToUpdate.completed; // Flip the boolean status

    // 4. (Optional) In a real application, save the updated todo to the database.
    // Example: await todoToUpdate.save();

    // 5. Respond with the updated todo item
    res.status(200).json({
      message: `Todo with ID ${id} status toggled successfully.`,
      todo: todoToUpdate
    });

  } catch (error) {
    // Log the error for debugging purposes (e.g., using a logging library like Winston or Pino)
    console.error(`Error toggling todo status for ID ${req.params.todoId}:`, error);

    // Send a generic 500 server error response
    res.status(500).json({ message: 'An unexpected server error occurred while toggling todo status.' });
  }
});

module.exports = router;