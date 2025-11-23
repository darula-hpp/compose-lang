import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem Component
 * Displays a single todo item with a checkbox to toggle completion
 * and a button to delete the todo.
 *
 * @param {object} props - The component props.
 * @param {object} props.todo - The todo object containing id, text, and completed status.
 * @param {function} props.onToggleComplete - Callback function to toggle the completion status of the todo.
 * @param {function} props.onDelete - Callback function to delete the todo.
 */
const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  // Destructure properties from the todo object for cleaner access
  const { id, text, completed } = todo;

  /**
   * Handles the change event for the checkbox.
   * Calls the `onToggleComplete` prop function, passing the todo's ID,
   * to update its completion status in the parent component.
   */
  const handleToggle = () => {
    onToggleComplete(id);
  };

  /**
   * Handles the click event for the delete button.
   * Calls the `onDelete` prop function, passing the todo's ID,
   * to remove the todo from the list in the parent component.
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
        // Add accessibility label for screen readers
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
        // Add accessibility label for screen readers
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </div>
  );
};

// Prop validation to ensure the component receives the correct data types and structure.
// This helps catch bugs early and improves component reliability.
TodoItem.propTypes = {
  /**
   * The todo object to display.
   * It must contain an `id` (string or number), `text` (string), and `completed` (boolean).
   */
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  /**
   * Callback function to be called when