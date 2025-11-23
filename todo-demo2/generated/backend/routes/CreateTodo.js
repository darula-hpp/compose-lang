const express = require('express');
const router = express.Router();

/**
 * @route POST /
 * @description Create a new todo item.
 * @access Public
 * @body {string} title - The title of the todo item. (Required)
 * @body {string} [description] - An optional description for the todo item.
 * @returns {object} 201 - The newly created todo item.
 * @returns {object} 400 - Bad Request if input validation fails.
 * @returns {object} 500 - Internal Server Error if an unexpected error occurs.
 */
router.post('/', (req, res) => {
    try {
        const { title, description } = req.body;

        // 1. Input Validation
        // Ensure title is provided, is a string, and is not empty.
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
        }

        // If description is provided, ensure it is a string.
        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({ message: 'Description must be a string if provided.' });
        }

        // 2. Business Logic Placeholder
        // In a real application, you would interact with a database here
        // to save the new todo item. For this example, we'll simulate it.

        // Generate a unique ID (in a real app, this would come from the database)
        const newTodoId = Math.floor(Math.random() * 1000000) + 1;

        const newTodo = {
            id: newTodoId,
            title: title.trim(),
            description: description ? description.trim() : '',
            completed: false, // New todos are typically not completed by default
            createdAt: new Date().toISOString() // Timestamp for creation
        };

        // Log the creation for demonstration purposes (remove in production or use a proper logger)
        console.log('New todo created:', newTodo);

        // 3. Send Success Response
        // According to REST best practices, a POST request that successfully creates
        // a resource should return a 201 Created status code and the newly created resource.
        res.status(201).json(newTodo);

    } catch (error) {
        // 4. Error Handling
        // Log the error for debugging purposes.
        console.error('Error creating todo item:', error);

        // Send a 500 Internal Server Error response for unexpected errors.
        res.status(500).json({ message: 'An unexpected error occurred while creating the todo item.', error: error.message });
    }
});

module.exports = router;