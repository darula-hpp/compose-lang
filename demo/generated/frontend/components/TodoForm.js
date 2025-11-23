import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * TodoForm Component
 * A functional component that provides a form to add new todo items.
 * It manages its own input state and handles form submission.
 */
function TodoForm() {
  // State to hold the current value of the todo input field
  const [todoText, setTodoText] = useState('');

  /**
   * Handles changes to the input field.
   * Updates the component's state with the new input value.
   * @param {Object} event - The change event object from the input field.
   */
  const handleChange = (event) => {
    setTodoText(event.target.value);
  };

  /**
   * Handles the form submission.
   * Prevents the default form submission behavior, processes the todo text,
   * and then clears the input field.
   * In a real application, this would typically dispatch an action to add the todo
   * to a global state manager or send it to an API.
   * @param {Object} event - The submit event object from the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default browser form submission

    // Trim whitespace from the input text
    const trimmedTodoText = todoText.trim();

    // Only proceed if the input text is not empty
    if (trimmedTodoText) {
      // --- Placeholder for actual todo creation logic ---
      // In a real application, you would typically pass this `trimmedTodoText`
      // up to a parent component via a prop function, or dispatch an action
      // to a state management system (e.g., Redux, Context API).
      console.log('Adding new todo:', trimmedTodoText);

      // Clear the input field after successful submission
      setTodoText('');
    } else {
      // Optional: Provide user feedback if the input is empty
      console.warn('Todo text cannot be empty.');
      // alert('Please enter a todo item!'); // Or display a more subtle message
    }
  };

  return (
    // The form element handles the submission of the new todo
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Add a new todo..."
        value={todoText} // Controlled component: input value is tied to state
        onChange={handleChange} // Update state on every input change
        aria-label="New todo item" // Accessibility label
      />
      <button type="submit" className="todo-button">
        Add Todo
      </button>
    </form>
  );
}

// PropTypes for TodoForm. Since there are no props, it's an empty object.
// This is included for completeness as per the requirement for prop validation.
TodoForm.propTypes = {};

export default TodoForm;