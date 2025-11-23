import React from 'react';
import PropTypes from 'prop-types';

const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  // Destructure properties from the todo object for easier access.
  const { id, text, completed } = todo;

  /**
   * Handles the change event for the checkbox.
   * Calls the onToggleComplete prop function with the todo's ID and its new completion status.
   */
  const handleToggle = () => {
    // Invert the current completed status and pass it to the parent handler.
    onToggleComplete(id, !completed);
  };

  /**
   * Handles the click event for the delete button.
   * Calls the onDelete prop function with the todo's ID.
   */
  const handleDeleteClick = () => {
    onDelete(id);
  };

  return (
    <li className={`todo-item ${completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
      />
      <span className="todo-text">{text}</span>
      <button
        onClick={handleDeleteClick}
        className="delete-button"
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </li>
  );
};

// Prop validation to ensure the component receives the correct data types.
TodoItem.propTypes = {
  // The 'todo' object containing details about a single todo item.
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired, // Unique identifier for the todo.
    text: PropTypes.string.isRequired, // The description of the todo.
    completed: PropTypes.bool.isRequired, // The completion status of the todo.
  }).isRequired,
  // Function to call when the todo's completion status changes.
  // It receives the todo's ID and the new completion status.
  onToggleComplete: PropTypes.func.isRequired,
  // Function to call when the todo is to be deleted.
  // It receives the todo's ID.
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;