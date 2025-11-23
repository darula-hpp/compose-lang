const express = require('express');
const router = express.Router();

// In-memory mock database for demonstration purposes.
// In a real application, this would interact with a persistent database.
const todos = [];
let nextTodoId = 1;

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo item
 *     description: Creates a new todo item with a title, optional description, and completion status.
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the todo item.
 *                 example: Buy groceries
 *               description:
 *                 type: string
 *                 description: An optional detailed description of the todo item.
 *                 example: Milk, eggs, bread, and cheese
 *               completed:
 *                 type: boolean
 *                 description: The completion status of the todo item. Defaults to false.
 *                 example: false
 *     responses:
 *       201:
 *         description: Todo item created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: Buy groceries
 *                 description:
 *                   type: string
 *                   nullable: true
 *                   example: Milk, eggs, bread, and cheese
 *                 completed:
 *                   type: boolean
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-27T10:00:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-27T10:00:00.000Z
 *       400:
 *         description: Invalid input provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Title is required and must be a non-empty string.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error while creating todo.
 */
router.post('/', (req, res) => {
    // Destructure and sanitize input from the request body
    const { title, description, completed } = req.body;

    // --- Input Validation ---
    // Validate 'title': It is required, must be a string, and cannot be empty.
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
    }

    // Validate 'description': If provided, it must be a string.
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string if provided.' });
    }

    // Validate 'completed': If provided, it must be a boolean.
    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Completed status must be a boolean if provided.' });
    }

    try {
        // --- Business Logic ---
        // Create a new todo object with a unique ID and default values
        const newTodo = {
            id: nextTodoId++, // Assign a unique ID and increment for the next item
            title: title.trim(), // Trim whitespace from the title
            description: description ? description.trim() : null, // Trim description or set to null if not provided
            completed: completed !== undefined ? completed : false, // Default to false if not provided
            createdAt: new Date().