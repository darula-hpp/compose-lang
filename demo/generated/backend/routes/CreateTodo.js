const express = require('express');
const router = express.Router();

// In a real application, this would be a database client or ORM.
// For demonstration, we'll use a simple in-memory array to simulate storage.
const todos = [];
let nextTodoId = 1;

/**
 * @api {post} / CreateTodo
 * @apiDescription Create a new todo item.
 * @apiGroup Todos
 * @apiBody {String} title The title of the todo item. Must be a non-empty string.
 * @apiBody {String} [description] The optional description of the todo item. Must be a string if provided.
 * @apiSuccess {String} id The unique identifier of the created todo item.
 * @apiSuccess {String} title The title of the todo item.
 * @apiSuccess {String} [description] The description of the todo item (if provided).
 * @apiSuccess {Boolean} completed The completion status of the todo item (defaults to `false`).
 * @apiSuccess {String} createdAt The ISO 8601 timestamp when the todo item was created.
 * @apiSuccessExample {json} Success-Response (201 Created):
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "1",
 *       "title": "Buy groceries",
 *       "description": "Milk, eggs, bread",
 *       "completed": false,
 *       "createdAt": "2023-10-27T10:00:00.000Z"
 *     }
 * @apiError (400 Bad Request) BadRequest Invalid input data provided.
 * @apiErrorExample {json} Error-Response (400 Bad Request):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Title is required and must be a non-empty string."
 *     }
 * @apiError (500 Internal Server Error) InternalServerError An unexpected server error occurred.
 * @apiErrorExample {json} Error-Response (500 Internal Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal Server Error"
 *     }
 */
router.post('/', (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Input Validation
    // Ensure title is present, is a string, and not empty after trimming whitespace.
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
    }

    // If description is provided, ensure it is a string.
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string if provided.' });
    }

    // 2. Simulate creating a new todo item
    // In a real application, this would involve interacting with a database.
    const newTodo = {
      id: String(nextTodoId++), // Generate a simple unique ID for the mock
      title: title.trim(),
      description: description ? description.trim() : undefined, // Store description only if provided
      completed: false, // New todos are not completed by default
      createdAt: new Date().toISOString(), // Record creation timestamp in ISO 8601 format
    };

    // Add the new todo to our mock storage
    todos.push(newTodo);

    // 3. Respond with the created resource
    // Use status 201 Created for successful resource creation as per REST best practices.
    res.status(201).json(newTodo);

  } catch (error) {
    // 4. General Error Handling for unexpected server issues
    console.error('Error creating todo item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;