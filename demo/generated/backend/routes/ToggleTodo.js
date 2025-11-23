const express = require('express');
const router = express.Router();

// In a real application, this would be a database model or service.
// For demonstration purposes, we'll use a simple in-memory array to simulate data.
const todos = [
    { id: '1', title: 'Learn Express', completed: false },
    { id: '2', title: 'Build API', completed: true },
    { id: '3', title: 'Deploy App', completed: false },
];

/**
 * PATCH /todos/:todoId
 * Toggles the 'completed' status of a specific todo item.
 *
 * This endpoint allows clients to flip the `completed` status of a todo item
 * identified by `todoId`. It follows REST API best practices for partial updates
 * where the server determines the new state based on the current state.
 *
 * @param {object} req - The Express request object, containing `todoId` in `req.params`.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the response is sent.
 */
router.patch('/todos/:todoId', async (req, res) => {
    try {
        const { todoId } = req.params;

        // 1. Input Validation:
        // Ensure `todoId` is provided, is a string, and is not empty.
        if (!todoId || typeof todoId !== 'string' || todoId.trim() === '') {
            // Respond with a 400 Bad Request for invalid input.
            return res.status(400).json({ message: 'Invalid todo ID provided. todoId must be a non-empty string.' });
        }

        // In a production application, you might validate `todoId` against a specific format
        // (e.g., UUID regex, MongoDB ObjectId regex) if your IDs follow a specific pattern.
        // Example for UUID validation:
        // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        // if (!uuidRegex.test(todoId)) {
        //     return res.status(400).json({ message: 'Invalid todo ID format. Must be a valid UUID.' });
        // }

        // 2. Business Logic - Find and Toggle:
        // Find the todo item by its ID in the mock data store.
        // In a real application, this would be a database query (e.g., `Todo.findById(todoId)`).
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        // If the todo item is not found, respond with a 404 Not Found.
        if (todoIndex === -1) {
            return res.status(404).json({ message: `Todo with ID '${todoId}' not found.` });
        }

        // Toggle the 'completed' status of the found todo item.
        // We create a new object using the spread operator to ensure immutability best practices,
        // although direct mutation of the object in the array would also work for this in-memory example.
        const updatedTodo = {
            ...todos[todoIndex],
            completed: !todos[todoIndex].completed, // Flip the boolean status (true to false, false to true)
        };

        // Update the mock data store with the toggled todo item.
        todos[todoIndex] = updatedTodo;

        // 3. Respond with Success:
        // Respond with the updated todo item and a 200 OK status.
        res.status(200).json(updatedTodo);

    } catch (error) {
        // 4. Error Handling:
        // Log the error for debugging purposes. In a production environment, use a dedicated logger
        // (e.g., Winston, Pino) instead of `console.error`.
        console.error(`Error toggling todo status for ID ${req.params.todoId}:`, error);

        // Respond with a 500 Internal Server Error for any unexpected issues that occur
        // during the request processing.
        res.status(500).json({ message: 'An unexpected error occurred while toggling todo status.', error: error.message });
    }
});

module.exports = router;