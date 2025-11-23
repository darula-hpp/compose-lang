import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem component displays a single todo item with a checkbox to toggle its completion status
 * and a button to delete it.
 *
 * @param {object} props - The component's props.
 * @param {object} props.todo - The todo object containing id, text, and completed status.
 * @param {function(string | number): void} [props.onToggleComplete] - Callback function to toggle the completion status of a todo.
 * @param {function(string | number): void} [props.onDelete] - Callback function to delete a todo.
 */
const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  // Destructure properties from the todo object for easier access
  const { id, text, completed } = todo;

  /**
   * Handles the change event of the checkbox.
   * Calls the onToggleComplete prop with the todo's id.
   */
  const handleToggle = () => {
    // Ensure onToggleComplete is a function before calling it
    if (typeof onToggleComplete === 'function') {
      onToggleComplete(id);
    }
  };

  /**
   * Handles the click event of the delete button.
   * Calls the onDelete prop with the todo's id.
   */
  const handleDelete = () => {
    // Ensure onDelete is a function before calling it
    if (typeof onDelete === 'function') {
      onDelete(id);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #eee',
        backgroundColor: completed ? '#f9f9f9' : '#ffffff',
      }}
    >
      {/* Checkbox to mark todo as complete or incomplete */}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        style={{ marginRight: '10px', cursor: 'pointer' }}
        aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
      />

      {/* Display the todo text, applying line-through style if completed */}
      <span
        style={{
          flexGrow: 1, // Allows the text to take up available space
          textDecoration: completed ? 'line-through' : 'none',
          color: completed ? '#888' : '#333',
          fontSize: '16px',
        }}
      >
        {text}
      </span>

      {/* Button to delete the todo item */}
      <button
        onClick={handleDelete}
        style={{
          marginLeft: '10px',
          padding: '6px 12px',
          backgroundColor: '#dc3545', // Bootstrap 'danger' color
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'background-color 0.2s ease',
        }}
        // Add hover effect for better user experience
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </div>
  );
};

// Prop validation for the TodoItem component to ensure correct prop types and required props
TodoItem.propTypes = {
  /**
   * The todo object to be displayed.
   * It must contain an `id`, `text`, and `completed` status.
   */
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  /**
   * Callback function triggered when the checkbox is toggled.
   * It receives the `id` of the todo as an argument.
   */
  onToggleComplete: PropTypes.func,
  /**
   * Callback function triggered when the delete button is clicked.
   * It receives the `id` of the todo as an argument.
   */
  onDelete: PropTypes.func,
};

// Default props to provide fallback functions for optional callbacks,
// preventing errors if they are not passed by the parent component.
TodoItem.defaultProps = {
  onToggleComplete: () => {}, // No-op function
  onDelete: () => {}, // No-op function
};

export default TodoItem;