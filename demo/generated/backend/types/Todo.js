/**
 * Represents a Todo item.
 * @class
 */
class Todo {
  /**
   * The unique identifier for the todo item.
   * @type {number}
   */
  id;

  /**
   * The title or description of the todo item.
   * @type {string}
   */
  title;

  /**
   * Indicates whether the todo item is completed.
   * @type {boolean}
   */
  completed;

  /**
   * Creates an instance of Todo.
   * @param {object} params - The parameters for creating a Todo item.
   * @param {number} params.id - The unique identifier for the todo item.
   * @param {string} params.title - The title or description of the todo item.
   * @param {boolean} [params.completed=false] - Indicates whether the todo item is completed. Defaults to false.
   */
  constructor({ id, title, completed = false }) {
    if (typeof id !== 'number') {
      throw new TypeError('Todo ID must be a number.');
    }
    if (typeof title !== 'string' || title.trim() === '') {
      throw new TypeError('Todo title must be a non-empty string.');
    }
    if (typeof completed !== 'boolean') {
      throw new TypeError('Todo completed status must be a boolean.');
    }

    this.id = id;
    this.title = title;
    this.completed = completed;
  }

  /**
   * Returns a plain object representation of the Todo item.
   * @returns {object} A plain object with id, title, and completed properties.
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
    };
  }
}