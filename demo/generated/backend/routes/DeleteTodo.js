const express = require('express');
const router = express.Router();

// --- Mock Database (In-memory array for demonstration purposes) ---
// In a real application, this would interact with a database (e.g., PostgreSQL, MongoDB).
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false }
];
// -----------------------------------------------------------------

/**
 * DELETE /api/todos/:id
 * Description: Delete a todo item by its unique ID.
 *
 * Request Parameters:
 *   - id (path parameter): The unique identifier of the todo item to delete.
 *     Expected type: integer (positive)
 *
 * Responses:
 *   - 204 No Content: Todo successfully deleted.
 *   - 400 Bad Request: Invalid ID format or missing ID.
 *   - 404 Not Found: Todo with the specified ID does not exist.
 *   - 500 Internal Server Error: An unexpected error occurred on the server.
 */
router.delete('/todos/:id', (req, res) => {
    // 1. Input Validation: Extract and validate the todo ID from request parameters.
    const todoId = parseInt(req.params.id, 10);

    // Check if the ID is a valid positive integer.
    if (isNaN(todoId) || todoId <= 0) {
        // Respond with 400 Bad Request if the ID is invalid.
        return res.status(400).json({ message: 'Invalid todo ID. ID must be a positive integer.' });
    }

    try {
        // 2. Business Logic: Attempt to find and delete the todo item.
        // In a real application, this would involve a database query (e.g., `DELETE FROM todos WHERE id = ?`).

        const initialTodosLength = todos.length;
        // Filter out the todo with the matching ID.
        todos = todos.filter(todo => todo.id !== todoId);

        // Check if the length of the todos array changed, indicating a deletion.
        if (todos.length === initialTodosLength) {
            // If no todo was deleted (length is the same), it means the todo was not found.
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // 3. Success Response: Send a 204 No Content status for a successful deletion.
        // This is a standard REST practice for DELETE operations that don't return a body.
        res.status(204).send();

    } catch (error) {
        // 4. Error Handling: Catch any unexpected errors during the process.
        console.error(`Error deleting todo with ID ${todoId}:`, error);
        // Respond with 500 Internal Server Error.
        res.status(500).json({ message: 'An unexpected error occurred while deleting the todo.' });
    }
});

module.exports = router;