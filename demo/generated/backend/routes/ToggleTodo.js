const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes
// In a real application, this would interact with a database (e.g., MongoDB, PostgreSQL)
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false }
];

/**
 * @swagger
 * /todos/{id}/toggle:
 *   patch:
 *     summary: Toggle todo completed status
 *     description: Toggles the 'completed' status of a specific todo item by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the todo item to toggle.
 *     responses:
 *       200:
 *         description: Todo status toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todo status toggled successfully.
 *                 todo:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     title: { type: string, example: "Learn Node.js" }
 *                     completed: { type: boolean, example: true }
 *       400:
 *         description: Invalid todo ID provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid todo ID provided.
 *       404:
 *         description: Todo not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todo with ID 999 not found.
 *       500:
 *         description: An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred while toggling todo status.
 */
router.patch('/todos/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;

        // Input validation: Ensure ID is a valid positive integer
        const todoId = parseInt(id, 10);
        if (isNaN(todoId) || todoId <= 0) {
            return res.status(400).json({ message: 'Invalid todo ID provided. ID must be a positive integer.' });
        }

        // Find the todo item by ID in the mock database
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        // If todo not found, return 404 Not Found
        if (todoIndex === -1) {
            return res.status(404).json({ message: `Todo with ID ${todoId} not found.` });
        }

        // Toggle the 'completed' status of the found todo item
        todos[todoIndex].completed = !todos[todoIndex].completed;

        // Return a 200 OK response with the updated todo item
        res.status(200).json({
            message: 'Todo status toggled successfully.',
            todo: todos[todoIndex]
        });

    } catch (error) {
        // Log the error for debugging purposes in a production environment
        console.error(`Error toggling todo status for ID ${req.params.id}:`, error);
        // Return a generic 500 Internal Server Error for unexpected issues
        res.status(500).json({ message: 'An unexpected error occurred while toggling todo status.' });
    }
});

module.exports = router;