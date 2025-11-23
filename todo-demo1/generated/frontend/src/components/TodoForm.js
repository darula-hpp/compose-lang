import React, { useState } from 'react';

function TodoForm() {
  // State to manage the input field's value for the new todo.
  const [todoText, setTodoText] = useState('');

  /**
   * Handles changes to the input field.
   * Updates the `todoText` state with the current value of the input element.
   * This makes the input a controlled component.
   * @param {Object} event - The change event object from the input element.
   */
  const handleChange = (event) => {
    setTodoText(event.target.value);
  };

  /**
   * Handles the form submission event.
   * Prevents the default browser form submission behavior.
   * Performs basic validation, logs the todo text (as a placeholder for actual logic),
   * and then clears the input field.
   * @param {Object} event - The form submission event object.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission to avoid page reload

    // Basic validation: ensure the input is not empty or just whitespace.
    if (todoText.trim() === '') {
      // In a production application, you might display an error message to the user
      // instead of just logging to the console.
      console.warn('Todo text cannot be empty. Please enter a value.');
      return; // Stop the submission process if validation fails
    }

    // --- Placeholder for actual todo addition logic ---
    // In a real application, this is where you would typically:
    // 1. Call a prop function (e.g., `props.onAddTodo(todoText)`) to pass the new todo
    //    up to a parent component or a global state management system (like Redux, Context API).
    // 2. Make an API call to a backend to save the todo.
    console.log('Attempting to add todo:', todoText); // Simulate adding a todo

    // Clear the input field after successful submission.
    setTodoText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={todoText}
        onChange={handleChange}
        placeholder="Add a new todo..."
        aria-label="New todo text input" // Provides an accessible label for screen readers
      />
      <button type="submit">Add Todo</button>
    </form>
  );
}

// No prop validation is needed for this component as it does not accept any props.
// If props were added (e.g., `onAddTodo`), PropTypes would be used here:
// import PropTypes from 'prop-types';
// TodoForm.propTypes = {
//   onAddTodo: PropTypes.func.isRequired,
// };

export default TodoForm;