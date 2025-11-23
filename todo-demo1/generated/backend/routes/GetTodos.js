const express = require('express');
const router = express.Router();

/**
 * @route GET /api/todos
 * @description Fetch all todos from the database.
 * @access Public
 * @returns {object} 200 - An array of todo objects.
 * @returns {object} 500 - Server error.
 */
router.get('/todos', async (req, res) => {
  try {
    // --- Input Validation ---
    // For fetching all todos, typically no specific input validation is needed
    // unless query parameters (e.g., 'limit', 'offset', 'sortBy') are expected.
    // Example if 'limit' was expected:
    // const { limit, offset } = req.query;
    // if (limit && isNaN(parseInt(limit))) {
    //   return res.status(400).json({ message: 'Validation Error: Limit must be a number.' });
    // }
    // if (offset && isNaN(parseInt(offset))) {
    //   return res.status(400).json({ message: 'Validation Error: Offset must be a number.' });
    // }

    // --- Simulate fetching todos from a database ---
    // In a real application, this would involve a call to a database service or ORM.
    // Example: const todos = await todoService.findAllTodos(req.query);
    const todos = await new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'todo-1', title: 'Learn Node.js', completed: false, createdAt: new Date() },
          { id: 'todo-2', title: 'Build Express API', completed: true, createdAt: new Date() },
          { id: 'todo-3', title: 'Deploy to cloud', completed: false, createdAt: new Date() }
        ]);
      }, 500); // Simulate network latency and database query time
    });

    // --- Send successful response ---
    // If no todos are found, it's generally a 200 OK with an empty array,
    // rather than a 404, as the endpoint itself exists and is functioning.
    if (!todos || todos.length === 0) {
      return res.status(200).json({
        message: 'No todos found.',
        data: [],
        count: 0
      });
    }

    res.status(200).json({
      message: 'Todos fetched successfully.',
      data: todos,
      count: todos.length
    });

  } catch (error) {
    // --- Error Handling ---
    // Log the error for debugging purposes. In a production environment,
    // use a dedicated logging library (e.g., Winston, Pino).
    console.error('Error fetching todos:', error);

    // Send a 500 Internal Server Error response.
    // Avoid sending raw error messages to clients in production for security reasons.
    res.status(500).json({
      message: 'Failed to fetch todos due to a server error.',
      // error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
      error: error.message // For development/debugging, can include message
    });
  }
});

module.exports = router;