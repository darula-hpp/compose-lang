const express = require('express');
const router = express.Router();

/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier for the todo.
 * @property {string} title - The title of the todo.
 * @property {boolean} completed - The completion status of the todo.
 */

/**
 * Mock database service for demonstration purposes.
 * In a real application, this would interact with a persistent database
 * (e.g., MongoDB with Mongoose, PostgreSQL with Sequelize/Knex, etc.).
 */
const todoService = {
    /**
     * Simulates fetching all todos from a database.
     * @returns {Promise<Array<Todo>>} A promise that resolves to an array of todo objects.
     */
    async findAll() {
        return new Promise(resolve => {
            // Simulate a network/database delay
            setTimeout(() => {
                const todos = [
                    { id: '1', title: 'Learn Node.js', completed: false },
                    { id: '2', title: 'Build an Express API', completed: true },
                    { id: '3', title: 'Deploy to production', completed: false },
                    { id: '4', title: 'Write documentation', completed: false },
                ];
                resolve(todos);
            }, 150); // Simulate a small delay
        });
    }
};

/**
 * @route GET /
 * @description Fetch all todos from the database.
 * @access Public
 *
 * This endpoint retrieves a list of all available todo items.
 * It follows REST API best practices by using the GET method for data retrieval
 * and returning a 200 OK status with a JSON array.
 * If no todos are found, it returns an empty array, which is standard for collection endpoints.
 */
router.get('/', async (req, res, next) => {
    try {
        // Input Validation:
        // For a simple 'fetch all' endpoint, there are typically no path or body parameters
        // to validate. If query parameters for filtering, sorting, or pagination were
        // expected (e.g., /todos?limit=10&offset=0), validation middleware (like Joi or express-validator)
        // would be used here to ensure they are valid.
        // Example:
        // const { error } = someValidationSchema.validate(req.query);
        // if (error) {
        //     return res.status(400).json({ message: error.details[0].message });
        // }

        // Fetch all todos using the mock service
        const todos = await todoService.findAll();

        // Respond with the fetched todos.
        // If no todos are found, an empty array is returned with a 200 OK status,
        // which is a standard and expected behavior for collection endpoints.
        res.status(200).json(todos);
    } catch (error) {
        // Error Handling:
        // Log the error for debugging purposes. In a production environment,
        // this would typically go to a centralized logging service (e.g., Winston, Pino).
        console.error('Error fetching todos:', error.message, error.stack);

        // Pass the error to the Express error handling middleware.
        // This allows a centralized error handler (defined in app.js or a dedicated file)
        // to catch and process the error, sending a consistent error response to the client
        // (e.g., 500 Internal Server Error).
        next(error);
    }
});

module.exports = router;