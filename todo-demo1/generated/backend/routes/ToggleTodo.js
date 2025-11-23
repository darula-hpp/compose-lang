const express = require('express');
const router = express.Router();

// In a real application, this would be a database model or service.
// We'll use a simple in-memory array for demonstration purposes.
let todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build an Express API', completed: true },
    { id: 3, title: 'Deploy to production', completed: false },
];

/**
 * @api {patch} /todos/:id/toggle ToggleTodo
 * @apiDescription Toggle todo completed status
 * @apiName ToggleTodo
 * @apiGroup Todo
 *
 * @apiParam {Number} id Todo unique ID.
 *
 * @apiSuccess {Object} todo The updated todo object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "title": "Learn Node.js",
 *       "completed": true
 *     }
 *
 * @apiError (Client Error) 400 BadRequest Invalid todo ID provided.
 * @apiError (Client Error) 404 NotFound The todo with the specified ID was not found.
 * @apiError (Server Error) 500 InternalServerError An unexpected error occurred.
 */
router.patch('/todos/:id/toggle', (req, res) => {
    const todoId = parseInt(req.params.id, 10);

    // 1. Input Validation
    // Check if todoId is a valid number
    if (isNaN(todoId)) {
        return res.status(400).json({
            message: 'Bad Request: Invalid todo ID provided. ID must be a number.'
        });
    }

    try {
        // 2. Find the todo item
        const todoIndex = todos.findIndex(todo => todo.id === todoId);

        // If todo not found
        if (todoIndex === -1) {
            return res.status(404).json({
                message: `Not Found: Todo with ID ${todoId} was not found.`
            });
        }

        // 3. Toggle the 'completed' status
        // Create a new object to avoid direct mutation of the original array item
        const updatedTodo = {
            ...todos[todoIndex],
            completed: !todos[todoIndex].completed
        };

        // 4. Update the todo in our "database" (in-memory array)
        todos[todoIndex] = updatedTodo;

        // 5. Send the updated todo as a response
        res.status(200).json(updatedTodo);

    } catch (error) {
        // 6. General Error Handling
        console.error(`Error toggling todo status for ID ${todoId}:`, error);
        res.status(500).json({
            message: 'Internal Server Error: An unexpected error occurred while toggling todo status.',
            error: error.message
        });
    }
});

module.exports = router;