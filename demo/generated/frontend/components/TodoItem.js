import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem Component
 * Displays a single todo item with a checkbox to toggle its completion status
 * and a button to delete the todo.
 *
 * @param {object} props - The component props.
 * @param {object} props.todo - The todo object containing its unique `id`, `text` content, and `completed` status.
 * @param {function} props.onToggleComplete - Callback function to be invoked when the checkbox is toggled.
 *                                          It receives the `id` of the todo item.
 * @param {function} props.onDelete - Callback function to be invoked when the delete button is clicked.
 *                                  It receives the `id` of the todo item.
 */
const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  // Defensive check: Ensure the 'todo' prop is provided and is an object.
  // In a production environment, this helps prevent runtime errors if data is missing.
  if (!todo || typeof todo !== 'object') {
    console.error('TodoItem: Invalid or missing "todo" prop.', todo);
    // Render nothing or a placeholder to avoid crashing the application.
    return null;
  }

  const { id, text, completed } = todo;

  /**
   * Handles the change event for the checkbox.
   * Calls the `onToggleComplete` prop function, passing the todo's ID.
   */
  const handleToggle = () => {
    onToggleComplete(id);
  };

  /**
   * Handles the click event for the delete button.
   * Calls the `onDelete` prop function, passing the todo's ID.
   */
  const handleDeleteClick = () => {
    onDelete(id);
  };

  return (
    <div className={`todo-item ${completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        // Add ARIA label for improved accessibility
        aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
      />
      <span
        className="todo-text"
        // Apply line-through style if the todo is completed
        style={{ textDecoration: completed ? 'line-through' : 'none' }}
      >
        {text}
      </span>
      <button
        onClick={handleDeleteClick}
        className="delete-button"
        // Add ARIA label for improved accessibility
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </div>
  );
};

// Prop validation using PropTypes for type safety and to catch common errors during development.
TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired, // Unique identifier for the todo item
    text: PropTypes.string.isRequired, // The description/text of the todo
    completed: PropTypes.bool.isRequired, // Boolean indicating if the todo