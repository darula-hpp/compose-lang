import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem component displays a single todo item with a checkbox and a delete button.
 * It allows users to toggle the completion status and delete the todo.
 *
 * @param {object} props - The component props.
 * @param {object} props.todo - The todo object containing id, text, and completed status.
 * @param {function} props.onToggleComplete - Callback function to toggle the completion status of the todo.
 * @param {function} props.onDelete - Callback function to delete the todo item.
 */
const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  /**
   * Handles the change event for the checkbox.
   * Calls the onToggleComplete prop function with the todo's ID.
   */
  const handleToggle = () => {
    // Ensure onToggleComplete is a function before calling
    if (typeof onToggleComplete === 'function') {
      onToggleComplete(todo.id);
    } else {
      console.error('onToggleComplete prop is not a function.');
    }
  };

  /**
   * Handles the click event for the delete button.
   * Calls the onDelete prop function with the todo's ID.
   */
  const handleDeleteClick = () => {
    // Ensure onDelete is a function before calling
    if (typeof onDelete === 'function') {
      onDelete(todo.id);
    } else {
      console.error('onDelete prop is not a function.');
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        // Add accessibility label for screen readers
        aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <span className="todo-text">{todo.text}</span>
      <button
        onClick={handleDeleteClick}
        className="delete-button"
        // Add accessibility label for screen readers
        aria-label={`Delete "${todo.text}"`}
      >
        Delete
      </button>
    </div>
  );
};

/**
 * Prop type validation for the TodoItem component.
 * Ensures that required props are provided and are of the correct type.
 */
TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;