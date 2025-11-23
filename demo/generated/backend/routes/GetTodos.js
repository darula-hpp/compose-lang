const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes.
// In a real application, this would be a call to a database service or ORM.
const mockTodosDb = [
    { id: '1', title: 'Learn Node.js', completed: false },
    { id: '2', title: 'Build an Express API', completed: true },
    { id: '3', title: 'Deploy to production', completed: false },
];

/**
 * @route GET /
 * @description Fetch all todos from the database.
 *              This endpoint assumes it's mounted under a base path like '/api/todos'.
 *              So the full path would be GET /api/todos.
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        // --- Input Validation ---
        // For fetching all todos, there are typically no path parameters.
        // If query parameters were expected (e.g., /todos?status=pending&limit=10),
        // validation would occur here using a library like 'express-validator' or Joi.
        // Example for query parameter validation (uncomment and adapt if needed):
        /*
        const { status, limit } = req.query;
        if (status && !['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided. Must be "pending" or "completed".' });
        }
        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) <= 0)) {
            return res.status(400).json({ message: 'Invalid limit provided. Must be a positive number.' });
        }
        */

        // --- Database Interaction ---
        // Simulate an asynchronous database call.
        // In a real application, this would be:
        // const todos = await TodoModel.find({}); // Using Mongoose
        // const todos = await db.collection('todos').find().toArray(); // Using MongoDB driver
        const todos = await new Promise(resolve => setTimeout(() => {
            // Apply any mock filtering if validation was implemented
            // let filteredTodos = mockTodosDb;
            // if (status) {
            //     filteredTodos = filteredTodos.filter(todo => todo.status === status);
            // }
            // if (limit) {
            //     filteredTodos = filteredTodos.slice(0, parseInt(limit));
            // }
            resolve(mockTodosDb); // For now, just return all mock todos
        }, 500)); // Simulate network latency

        // --- Response ---
        // Send the fetched todos as a JSON array with a 200 OK status.
        res.status(200).json(todos);

    } catch (error) {
        // --- Error Handling ---
        // Log the error for debugging purposes. In a production environment,