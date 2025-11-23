const express = require('express');
const router = express.Router();

// --- Mock Database (for demonstration purposes) ---
// In a real application, this would be replaced with a database interaction (e.g., Mongoose, Sequelize, Prisma).
// For production, consider a dedicated data access layer.
const todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * PATCH /todos/:todoId/toggle
 * Description: Toggles the 'completed' status of a specific todo item.
 *
 * This endpoint expects a todo ID in the URL path. It will find the todo
 * by its ID and flip its 'completed' status (true to false, or false to true).
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
router.patch('/todos/:todoId/toggle', async (req, res) => {
    try {
        // 1. Input Validation: Extract and validate todoId from path parameters.
        // Ensure todoId is a valid positive integer.
        const todoId = parseInt(req.params.todoId, 10);

        if (isNaN(todoId) || todoId <= 0) {
            // Respond with 400 Bad Request if todoId is not a valid positive integer.
            return res.status(400).json({
                message: 'Invalid todo ID provided. ID must be a positive number.',
                code: 'INVALID_TODO_ID'
            });
        }

        // 2. Business Logic: Find the todo item in the mock database.
        // In a real application, this would involve a database query (e.g., `Todo.findById(todoId)`).
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        // If todo not found, return 404 Not Found.
        if (todoIndex === -1) {
            return res.status(404).json({
                message: `Todo with ID ${todoId} not found.`,
                code: 'TODO_NOT_FOUND'
            });
        }

        // 3. Update Data: Toggle the 'completed' status of the found todo.
        // In a real application, this would be a database update operation.
        todos[todoIndex].completed = !todos[todoIndex].completed;

        // Create a copy of the updated todo to return. This is good practice
        // to avoid returning direct references to internal data structures,
        // especially if they might be modified elsewhere.
        const updatedTodo = { ...todos[todoIndex] };

        // 4. Respond: Send a success response (200 OK) with the updated todo item.
        res.status(200).json({
            message: 'Todo status toggled successfully.',
            data: updatedTodo
        });

    } catch (error) {
        // 5. Error Handling: Catch any unexpected server-side errors.
        // Log the error for debugging purposes without exposing sensitive details to the client.
        console.error(`[ToggleTodo API] Error processing request for todo ID ${req.params.todoId}:`, error);
        res.status(500).json({
            message: 'An unexpected server error occurred while toggling todo status.',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
});

module.exports = router;