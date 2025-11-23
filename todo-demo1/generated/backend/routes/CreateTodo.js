const express = require('express');
const router = express.Router();

// In-memory "database" for demonstration purposes
// In a real application, this would interact with a persistent database
const todos = [];
let nextTodoId = 1;

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo item
 *     description: Creates a new todo item with a title, optional description, and optional completion status.
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
 *                 example: "Buy groceries"
 *               description:
 *                 type: string
 *                 description: A detailed description of the todo item.
 *                 example: "Milk, eggs, bread, and cheese"
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
 *                   type: integer
 *                   description: The unique identifier of the todo item.
 *                   example: 1
 *                 title:
 *                   type: string
 *                   description: The title of the todo item.
 *                   example: "Buy groceries"
 *                 description:
 *                   type: string
 *                   description: A detailed description of the todo item.
 *                   example: "Milk, eggs, bread, and cheese"
 *                 completed:
 *                   type: boolean
 *                   description: The completion status of the todo item.
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the todo item was created.
 *                   example: "2023-10-27T10:00:00.000Z"
 *       400:
 *         description: Bad Request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title is required and must be a non-empty string."
 *       500:
 *         description: Internal Server Error - Something went wrong on the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create todo item."
 */
router.post('/', (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // 1. Input Validation
    // Ensure title is provided and is a non-empty string
    if (typeof title !== 'string' || title.trim().length === 0) {
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

    // 2. Create new todo item
    const newTodo = {
      id: nextTodoId++, // Assign a unique ID
      title: title.trim(),
      description: description ? description.trim() : '', // Default to empty string if not provided
      completed: completed || false, // Default to false if not provided
      createdAt: new Date().toISOString(), // Timestamp for creation
    };

    // 3. Simulate saving to a database (add to in-memory array)
    todos.push(newTodo);

    // 4. Send successful response
    // Use 201 Created status code for successful resource creation
    res.status(201).json(newTodo);

  } catch (error) {
    // 5. Error Handling for unexpected errors
    console.error('Error creating todo item:', error);
    res.status(500).json({ message: 'Failed to create todo item.', error: error.message });
  }
});

module.exports = router;