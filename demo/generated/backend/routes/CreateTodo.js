const express = require('express');
const router = express.Router();

// In a real application, this would be a database model or service.
// We'll use a simple in-memory array for demonstration purposes.
const todos = [];
let nextId = 1; // Simple ID generator for mock data

/**
 * @route POST /todos
 * @description Create a new todo item
 * @access Public
 * @body {string} title - The title of the todo item (required)
 * @body {string} [description] - An optional description for the todo item
 * @body {boolean} [completed=false] - The completion status of the todo item
 */
router.post('/todos', (req, res) => {
    try {
        // Destructure and sanitize input from the request body
        const { title, description, completed } = req.body;

        // 1. Input Validation
        // Ensure title is provided, is a string, and is not empty
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
        }

        // Validate description if provided
        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({ message: 'Description must be a string if provided.' });
        }

        // Validate completed status if provided
        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).json({ message: 'Completed status must be a boolean if provided.' });
        }

        // 2. Business Logic: Create the new todo item
        const newTodo = {
            id: nextId++, // Assign a unique ID
            title: title.trim(),
            description: description ? description.trim() : '', // Default to empty string if not provided
            completed: completed || false, // Default to false if not provided
            createdAt: new Date().toISOString() // Add a creation timestamp
        };

        // In a production application, you would interact with a database here
        // e.g., `await TodoModel.create(newTodo);`
        todos.push(newTodo); // Add to our mock data store

        // 3. Respond with the newly created resource
        // Use 201 Created status code for successful resource creation
        res.status(201).json(newTodo);

    } catch (error) {
        // 4. Error Handling
        // Log the error for debugging purposes. In a real app, use a dedicated logger.
        console.error('Error creating todo item:', error);

        // Respond with a 500 Internal Server Error for unexpected issues
        res.status(500).json({ message: 'An unexpected error occurred while creating the todo item.' });
    }
});

module.exports = router;