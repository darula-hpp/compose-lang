const express = require('express');
const router = express.Router();

// --- Mock Data Store (for demonstration purposes only) ---
// In a production application, this data would typically come from a database
// via a service or repository layer. This array simulates a collection of todo items.
let todos = [
    { id: '1', title: 'Learn Node.js', completed: false },
    { id: '2', title: 'Build an Express API', completed: true },
    { id: '3', title: 'Deploy to production', completed: false },
];
// ---------------------------------------------------------

/**
 * PATCH /todos/:id/toggle
 *
 * Toggles the 'completed' status of a specific todo item.
 * This endpoint expects a todo ID as a URL parameter.
 *
 * @param {object} req - The Express request object, containing parameters.
 * @param {object} res - The Express response object, used to send back data or errors.
 * @returns {void}
 */
router.patch('/todos/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        // Input Validation:
        // Ensure the 'id' parameter is provided and is a non-empty string.
        // In a production environment, consider more robust validation (e.g., UUID format, numeric ID)
        // using a dedicated validation library like 'express-validator' or 'Joi'.
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid todo ID provided. ID must be a non-empty string.' });
        }

        // Find the todo item by its ID in the mock data store.
        // In a real application, this would be an asynchronous call to a database
        // (e.g., `const todo = await TodoService.findById(id);`).
        const todoIndex = todos.findIndex(todo => todo.id === id);

        // Handle 'Todo Not Found' scenario:
        // If no todo item matches the provided ID, return a 404 Not Found response.
        if (todoIndex === -1) {
            return res.status(404).json({ message: `Todo with ID '${id}' not found.` });
        }

        // Retrieve the todo item and toggle its 'completed' status.
        const todoToUpdate = todos[todoIndex];
        todoToUpdate.completed = !todoToUpdate.completed;

        // Simulate saving the updated todo back to the data store.
        // In a real application, this would be an asynchronous database update operation
        // (e.g., `await TodoService.update(id, { completed: todoToUpdate.completed });`).
        todos[todoIndex] = todoToUpdate; // Update the item in our mock array

        // Respond with the successfully updated todo item and a 200 OK status.
        res.status(200).json(todoToUpdate);

    } catch (error) {
        // General Error Handling:
        // Log the error for debugging and operational monitoring purposes.
        console.error(`Error toggling todo status for ID '${req.params.id}':`, error);

        // Send a generic 500 Internal Server Error response to the client.
        // In a production environment, avoid exposing detailed error messages to clients
        // for security reasons. Provide a more user-friendly message.
        res.status(500).json({
            message: 'An unexpected error occurred while toggling todo status.',
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
});

module.exports = router;