const express = require('express');
const router = express.Router();

/**
 * @route GET /api/todos
 * @description Fetch all todos from the database.
 * @access Public
 * @returns {object} 200 - An array of todo objects.
 * @returns {object} 400 - If invalid query parameters are provided.
 * @returns {object} 500 - If a server error occurs.
 */
router.get('/todos', async (req, res) => {
    try {
        // Input Validation: For a simple 'fetch all' endpoint,
        // we typically don't expect query parameters unless for filtering or pagination.
        // If no such functionality is intended, reject unexpected query parameters.
        if (Object.keys(req.query).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters. This endpoint does not support query parameters for fetching all todos.'
            });
        }

        // --- Simulate database call to fetch all todos ---
        // In a real application, this would involve calling a service or repository layer
        // that interacts with your database (e.g., Mongoose, Sequelize, Knex, etc.).
        // Example: const todos = await todoService.findAll();
        const todos = [
            { id: '1', title: 'Learn Express', completed: false, createdAt: new Date() },
            { id: '2', title: 'Build API', completed: true, createdAt: new Date() },
            { id: '3', title: 'Deploy App', completed: false, createdAt: new Date() }
        ];
        // --- End simulation ---

        // If no todos are found, it's still a successful operation, just an empty list.
        // A 200 OK with an empty array is standard practice for 'fetch all'.
        if (!todos || todos.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No todos found.',
                data: []
            });
        }

        // Respond with the fetched todos
        res.status(200).json({
            success: true,
            message: 'Todos fetched successfully.',
            data: todos
        });

    } catch (error) {
        // Log the error for debugging purposes. In a production environment,
        // use a dedicated logging library (e.g., Winston, Pino) and avoid
        // exposing raw error details to the client.
        console.error('Error fetching todos:', error);

        // Send a 500 Internal Server Error response
        res.status(500).json({
            success: false,
            message: 'Failed to fetch todos due to a server error.',
            // In production, consider a generic error message like:
            // 'An unexpected error occurred. Please try again later.'
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
        });
    }
});

module.exports = router;