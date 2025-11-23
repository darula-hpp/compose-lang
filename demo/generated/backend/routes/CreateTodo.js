const express = require('express');
const router = express.Router();

// In-memory "database" for demonstration purposes.
// In a real application, this would be replaced with a persistent database (e.g., MongoDB, PostgreSQL).
const todos = [];
let nextTodoId = 1;

/**
 * @api {post} /todos CreateTodo
 * @apiDescription Create a new todo item
 * @apiGroup Todos
 * @apiBody {String} title The title of the todo item.
 * @apiBody {String} [description] An optional description for the todo item.
 * @apiSuccess {Number} id The unique ID of the todo item.
 * @apiSuccess {String} title The title of the todo item.
 * @apiSuccess {String} [description] The description of the todo item.
 * @apiSuccess {Boolean} completed The completion status of the todo item (defaults to false).
 * @apiSuccess {String} createdAt The ISO timestamp when the todo item was created.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 1,
 *       "title": "Buy groceries",
 *       "description": "Milk, eggs, bread",
 *       "completed": false,
 *       "createdAt": "2023-10-27T10:00:00.000Z"
 *     }
 * @apiError (400 Bad Request) ValidationError Invalid input data.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Title is required and must be a non-empty string."
 *     }
 * @apiError (500 Internal Server Error) ServerError An unexpected error occurred.
 * @apiErrorExample {json