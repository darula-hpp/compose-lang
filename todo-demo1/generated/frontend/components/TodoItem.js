import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem component displays a single todo item with a checkbox to toggle completion
 * and a button to delete the todo.
 *
 * @param {object} props - The component props.
 * @param {object} props.todo - The todo object containing id, text, and completed status.
 * @param {function} props.onToggleComplete - Callback function to toggle the completion status of the todo.
 * @param {function} props.onDelete - Callback function to delete the todo.
 */
const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  // Destructure properties from the todo object for easier access
  const { id, text, completed } = todo;

  /**
   * Handles the change event of the checkbox.
   * Calls the onToggleComplete prop with the todo's ID.
   */
  const handleToggle = () => {
    // Ensure onToggleComplete is a function before calling
    if (typeof onToggleComplete === 'function') {
      onToggleComplete(id);
    } else {
      console.error('onToggleComplete prop is not a function.');
    }
  };

  /**
   * Handles the click event of the delete button.
   * Calls the onDelete prop with the todo's ID.
   */
  const handleDelete = () => {
    // Ensure onDelete is a function before calling
    if (typeof onDelete === 'function') {
      onDelete(id);
    } else {
      console.error('onDelete prop is not a function.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
      {/* Checkbox to mark todo as complete or incomplete */}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        // Add an accessible label for screen readers
        aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
      />
      {/* Display the todo text, applying line-through style if completed */}
      <span style={{ textDecoration: completed ? 'line-through' : 'none', flexGrow: 1 }}>
        {text}
      </span>
      {/* Button to delete the todo item */}
      <button onClick={handleDelete} aria-label={`Delete "${text}"`}>
        Delete
      </button>
    </div>
  );
};

/**
 * Prop type validation for the TodoItem component.
 * Ensures that props are of the expected type and are required.
 */
TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired, // Unique identifier for the todo
    text: PropTypes.string.isRequired, // The description of the todo
    completed: PropTypes.bool.isRequired, // Completion status of the todo
  }).isRequired,
  onToggleComplete: PropTypes.func.isRequired, // Function to call when checkbox is toggled
  onDelete: PropTypes.func.isRequired, // Function to call when delete button is clicked
};

export default TodoItem;