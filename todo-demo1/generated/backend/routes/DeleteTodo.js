const express = require('express');
const router = express.Router();

// In a real application, this would be replaced with a database interaction (e.g., Mongoose, Sequelize, Knex).
// For demonstration, we'll use a simple in-memory array to simulate our data store.
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * DELETE /api/todos/:id
 * Description: Deletes a todo item by its unique ID.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
router.delete('/todos/:id', async (req, res) => {
    // Extract the todo ID from the request parameters.
    const { id } = req.params;

    // --- Input Validation ---
    // Convert the ID to an integer.
    const todoId = parseInt(id, 10);

    // Check if the ID is a valid positive integer.
    if (isNaN(todoId) || todoId <= 0) {
        // Respond with a 400 Bad Request if the ID is invalid.
        return res.status(400).json({ message: 'Invalid todo ID provided. ID must be a positive integer.' });
    }

    try {
        // --- Simulate Database Operation ---
        // In a real application, you would perform a database delete operation here.
        // Example: const result = await TodoModel.deleteOne({ _id: todoId });
        // if (result.deletedCount === 0) { ... }

        // Simulate finding and deleting a todo from our mock database.
        const initialLength = todos.length;
        // Filter out the todo with the matching ID.
        todos = todos.filter(todo => todo.id !== todoId);

        // Check if any todo was actually removed.
        if (todos.length === initialLength) {
            // If the length hasn't changed, it means no todo with that ID was found.
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // --- Success Response ---
        // Respond with 204 No Content for a successful deletion.
        // This status code indicates that the server has successfully fulfilled the request
        // and that there is no content to send in the response payload body.
        res.status(204).send();

    } catch (error) {
        // --- Error Handling ---
        // Log the error for debugging purposes.
        console.error(`Error deleting todo with ID ${todoId}:`, error);

        // Respond with a 500 Internal Server Error for any unexpected issues
        // that occurred during the deletion process.
        res.status(500).json({
            message: 'An unexpected error occurred while deleting the todo.',
            error: error.message
        });
    }
});

module.exports = router;