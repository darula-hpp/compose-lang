const express = require('express');
const router = express.Router();

// In a real application, this would be a database model or service.
// For demonstration, we'll use a simple in-memory array to simulate data.
// This array persists across requests as it's defined outside the route handler.
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: false },
    { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * DELETE /todos/:id
 * Description: Delete a todo by ID
 */
router.delete('/todos/:id', async (req, res) => {
    try {
        // Extract the todo ID from the request parameters
        const { id } = req.params;

        // --- Input Validation ---
        // Check if the ID is provided in the URL path.
        // While Express routing typically handles this, it's a good defensive check.
        if (!id) {
            return res.status(400).json({ message: 'Todo ID is required in the URL path.' });
        }

        // Validate if the ID is a valid number.
        // For applications using UUIDs, a regex validation would be used instead of parseInt.
        const todoId = parseInt(id, 10);
        if (isNaN(todoId)) {
            return res.status(400).json({ message: 'Invalid Todo ID format. Must be a number.' });
        }

        // --- Simulate Database Operation ---
        // In a production application, this would involve an asynchronous call
        // to a database (e.g., `await TodoModel.findByIdAndDelete(todoId);`).
        // For this example, we're manipulating an in-memory array.

        // Find the index of the todo item in our in-memory array
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        // If the todo item is not found, return a 404 Not Found response
        if (todoIndex === -1) {
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // Remove the todo item from the array using its index
        todos.splice(todoIndex, 1);

        // --- Success Response ---
        // Respond with 204 No Content. This status code is standard for successful
        // DELETE requests where no content is returned in the response body.
        res.status(204).send();

    } catch (error) {
        // --- Error Handling ---
        // Log the error for server-side debugging. In production, use a robust logger.
        console.error(`Error deleting todo with ID ${req.params.id}:`, error);

        // Send a 500 Internal Server Error response to the client.
        // Avoid exposing sensitive error details in production environments.
        res.status(500).json({
            message: 'An unexpected error occurred while deleting the todo.',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message // Only expose error message in non-production
        });
    }
});

module.exports = router;