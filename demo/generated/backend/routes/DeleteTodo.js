const express = require('express');
const router = express.Router();

// In a real application, todoService would be imported from a separate module,
// e.g., const todoService = require('../services/todoService');
// For demonstration, a mock service is assumed to exist and provide `deleteTodo` and `getTodoById` methods.
// Example mock service structure:
/*
const todoService = {
    // A simple in-memory store for demonstration
    _todos: [
        { id: 1, title: 'Learn Node.js', completed: false },
        { id: 2, title: 'Build an Express API', completed: true },
        { id: 3, title: 'Deploy to production', completed: false },
    ],

    async deleteTodo(id) {
        const initialLength = this._todos.length;
        this._todos = this._todos.filter(todo => todo.id !== id);
        return this._todos.length < initialLength; // Returns true if an item was removed
    },

    async getTodoById(id) {
        return this._todos.find(todo => todo.id === id);
    }
};
*/

/**
 * DELETE /api/todos/:id
 *
 * Deletes a todo item by its unique ID.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
router.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Input Validation: Validate the ID from request parameters.
        // Ensure the ID is a valid integer.
        const todoId = parseInt(id, 10);
        if (isNaN(todoId) || todoId.toString() !== id) {
            // If parseInt results in NaN or if the original string contains non-numeric characters
            // (e.g., "123abc" would parse to 123, but "123" !== "123abc"), it's an invalid ID.
            return res.status(400).json({ message: 'Invalid todo ID format. ID must be an integer.' });
        }

        // 2. Check if the todo exists before attempting to delete.
        // This provides a more specific 404 Not Found error if the todo doesn't exist,
        // which is better than a generic deletion failure.
        const existingTodo = await todoService.getTodoById(todoId);
        if (!existingTodo) {
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // 3. Business Logic: Attempt to delete the todo item.
        const isDeleted = await todoService.deleteTodo(todoId);

        if (isDeleted) {
            // 4. Success Response: 204 No Content is the standard response for a successful
            // DELETE request where no content is returned to the client.
            res.status(204).send();
        } else {
            // This case should ideally be prevented by the `existingTodo` check.
            // It acts as a fallback for potential race conditions or unexpected service issues.
            console.error(`Failed to delete todo with ID ${todoId} after it was found.`);
            res.status(500).json({ message: 'Failed to delete todo due to an unexpected issue.' });
        }

    } catch (error) {
        // 5. Error Handling: Catch any unexpected errors that occur during the process.
        console.error(`Error deleting todo with ID ${req.params.id}:`, error);
        // Respond with a 500 Internal Server Error for unhandled exceptions.
        res.status(500).json({ message: 'An unexpected error occurred while deleting the todo.' });
    }
});

module.exports = router;