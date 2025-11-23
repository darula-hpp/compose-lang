import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem component displays a single todo item with a checkbox and a delete button.
 * It is a presentational component and does not handle state changes for the todo itself.
 * Interaction logic (e.g., toggling completion, deleting) would typically be passed
 * down as callback functions from a parent component.
 *
 * @param {object} props - The component props.
 * @param {object} props.todo - The todo object to display.
 * @param {string|number} props.todo.id - The unique identifier for the todo.
 * @param {string} props.todo.text - The text content of the todo.
 * @param {boolean} props.todo.completed - The completion status of the todo.
 */
const TodoItem = ({ todo }) => {
  // Destructure todo properties for easier access and readability within the component.
  const { id, text, completed } = todo;

  return (
    // The root element for the todo item.
    // In a real application, this div would likely have a class for external styling.
    <div>
      {/* Checkbox to indicate the todo's completion status. */}
      {/* The 'checked' attribute is controlled by the 'completed' prop. */}
      {/* 'readOnly' is used here to make the checkbox non-interactive for presentational purposes. */}
      {/* For interactivity, an 'onChange' handler would be passed from a parent component */}
      {/* to update the todo's completion status. */}
      <input
        type="checkbox"
        checked={completed}
        readOnly
      />

      {/* Display the todo text. */}
      {/* In a real application, this span might have a class to apply styles */}
      {/* like line-through or change color based on the 'completed' status. */}
      <span>
        {text}
      </span>

      {/* Button to delete the todo item. */}
      {/* For interactivity, an 'onClick' handler would be passed from a parent component */}
      {/* to trigger the deletion of this specific todo item. */}
      <button>
        Delete
      </button>
    </div>
  );
};

// Prop validation to ensure the 'todo' prop is provided and has the expected structure.
// This helps catch common errors during development and provides helpful warnings in the console.
TodoItem.propTypes = {
  todo: PropTypes.shape({
    // 'id' can be either a string or a number and is required for unique identification.
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    // 'text' is the string content of the todo item and is required.
    text: PropTypes.string.isRequired,
    // 'completed' is a boolean indicating the todo's status and is required.
    completed: PropTypes.bool.isRequired,
  }).isRequired, // The entire 'todo' object is required.
};

export default TodoItem;