const express = require('express');
const router = express.Router();

// In a real application, this would be a database model or service.
// We'll use a simple in-memory array for demonstration purposes.
const todos = [];
let nextTodoId = 1;

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo item
 *     description: Creates a new todo item with a title and optional description.
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
 *                 description: A detailed description of the todo item.
 *                 example: Milk, eggs, bread, and fruits.
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
 *                   example: Buy groceries
 *                 description:
 *                   type: string
 *                   description: A detailed description of the todo item.
 *                   example: Milk, eggs, bread, and fruits.
 *                 completed:
 *                   type: boolean
 *                   description: Indicates if the todo item is completed.
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the todo item was created.
 *                   example: 2023-10-27T10:00:00Z
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
 *                   example: An unexpected error occurred while creating the todo.
 */
router.post('/todos', async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Input Validation
    // Ensure title is provided and is a non-empty string.
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string if provided.' });
    }

    // 2. Business Logic (Simulated)
    // In a real application, this would involve interacting with a database.
    // For demonstration, we'll create a new todo object and add it to our in-memory array.
    const newTodo = {
      id: nextTodoId++, // Assign a unique ID
      title: title.trim(),
      description: description ? description.trim() : null,
      completed: false, // New todos are not completed by default
      createdAt: new Date().toISOString(), // Timestamp of creation
    };

    // Simulate saving to a database (e.g., await TodoModel.create(newTodo))
    todos.push(newTodo);

    // 3. Respond with the created resource
    // According to REST best practices, a successful creation should return 201 Created
    // and include the newly created resource in the response body.
    res.status(201).json(newTodo);

  } catch (error) {
    // 4. Error Handling
    // Log the error for debugging purposes (in a real app, use a logger like Winston or Pino).
    console.error('Error creating todo:', error);

    // Send a generic 500 Internal Server Error response.
    // Avoid exposing sensitive error details to the client in production.
    res.status(500).json({ message: 'An unexpected error occurred while creating the todo.' });
  }
});

module.exports = router;