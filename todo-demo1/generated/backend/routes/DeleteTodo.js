const express = require('express');
const router = express.Router();

// In a real application, this would be a database or service layer interaction.
// We'll use a simple in-memory array for demonstration purposes.
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * DELETE /todos/:id
 * Description: Delete a todo by ID.
 *
 * Deletes a specific todo item from the list based on its unique ID.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
router.delete('/todos/:id', (req, res) => {
    try {
        // 1. Input Validation
        // Extract the todo ID from the request parameters.
        const todoId = parseInt(req.params.id, 10);

        // Validate if the ID is a valid positive integer.
        if (isNaN(todoId) || todoId <= 0) {
            // Respond with a 400 Bad Request if the ID is invalid.
            return res.status(400).json({ message: 'Invalid todo ID. ID must be a positive integer.' });
        }

        // 2. Business Logic: Find and Delete the Todo
        // Store the initial length to check if an item was actually removed.
        const initialLength = todos.length;
        
        // Filter out the todo with the matching ID.
        todos = todos.filter(todo => todo.id !== todoId);

        // Check if the length of the todos array changed.
        // If it didn't change, it means no todo with the given ID was found.
        if (todos.length === initialLength) {
            // Respond with a 404 Not Found if the todo does not exist.
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // 3. Respond with Success
        // According to REST best practices, a successful DELETE operation
        // that does not return any content should respond with 204 No Content.
        res.status(204).send();

    } catch (error) {
        // 4. Error Handling for unexpected server errors
        // Log the error for debugging purposes.
        console.error(`Error deleting todo with ID ${req.params.id}:`, error);
        // Respond with a 500 Internal Server Error for any unhandled exceptions.
        res.status(500).json({ message: 'An unexpected error occurred while deleting the todo.' });
    }
});

module.exports = router;