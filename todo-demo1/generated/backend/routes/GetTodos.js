const express = require('express');
const router = express.Router();

/**
 * @route GET /todos
 * @description Fetch all todos from the database.
 * @access Public
 */
router.get('/todos', async (req, res) => {
  try {
    // --- Input Validation (if any query parameters were expected) ---
    // For fetching all todos, typically no specific input validation is needed
    // unless there are optional query parameters like 'limit', 'offset', 'sortBy'.
    // Example:
    // const { limit, offset } = req.query;
    // if (limit && isNaN(parseInt(limit))) {
    //   return res.status(400).json({ message: 'Invalid limit parameter.' });
    // }

    // --- Simulate Database Interaction ---
    // In a real application, you would interact with your database here
    // (e.g., using Mongoose, Sequelize, Knex, or a direct SQL client).
    // This is a placeholder for fetching data.
    const todos = await new Promise(resolve => {
      setTimeout(() => {
        // Mock data representing todos from a database
        const mockTodos = [
          { id: '1', title: 'Learn Node.js', completed: false, createdAt: new Date() },
          { id: '2', title: 'Build an Express API', completed: true, createdAt: new Date() },
          { id: '3', title: 'Deploy to production', completed: false, createdAt: new Date() },
        ];
        resolve(mockTodos);
      }, 500); // Simulate network delay
    });

    // --- Send Response ---
    // If no todos are found, an empty array is a valid successful response (200 OK).
    res.status(200).json(todos);

  } catch (error) {
    // --- Error Handling ---
    // Log the error for debugging purposes (in a real app, use a logger like Winston or Pino)
    console.error('Error fetching todos:', error.message);

    // Send a 500 Internal Server Error response
    // Avoid sending raw error details to the client in production for security reasons.
    res.status(500).json({ message: 'Failed to fetch todos. Please try again later.' });
  }
});

module.exports = router;