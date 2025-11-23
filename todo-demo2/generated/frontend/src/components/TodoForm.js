import React, { useState } from 'react';
// No PropTypes needed as the component does not accept any props.

/**
 * TodoForm Component
 * A functional component that provides a form to add new todo items.
 * It manages its own input state and handles form submission.
 */
function TodoForm() {
  // State to hold the current value of the todo input field.
  // Initialized as an empty string.
  const [todoText, setTodoText] = useState('');

  /**
   * Handles changes to the input field.
   * Updates the `todoText` state with the current value of the input.
   * @param {Object} event - The change event object from the input element.
   */
  const handleChange = (event) => {
    setTodoText(event.target.value);
  };

  /**
   * Handles the form submission.
   * Prevents the default form submission behavior (page reload).
   * Validates the input, logs the todo text, and clears the input field.
   * In a real application, this would typically send the todo to a parent component
   * or a global state management system (e.g., Redux, Context API) to be added to a list.
   * @param {Object} event - The submit event object from the form element.
   */
  const handleSubmit = (event) => {
    // Prevent the default form submission behavior which causes a page reload.
    event.preventDefault();

    // Basic validation: Check if the input field is not empty or just whitespace.
    if (todoText.trim() === '') {
      // Optionally, display an error message to the user.
      // For now, we'll just log to the console.
      console.error('Todo text cannot be empty.');
      return; // Stop the submission if validation fails.
    }

    // In a production application, you would typically pass this `todoText`
    // to a parent component via a prop function (e.g., `onAddTodo(todoText)`).
    // For this example, we'll just log it to the console.
    console.log('New Todo Added:', todoText);

    // Clear the input field after successful submission.
    setTodoText('');
  };

  return (
    // The form element handles the submission.
    <form onSubmit={handleSubmit}>
      {/* Label for accessibility, linked to the input by its id. */}
      <label htmlFor="todo-input">
        Add New Todo:
      </label>
      {/* Input field for the todo text. */}
      <input
        id="todo-input" // Unique ID for the input, linked to the label.
        type="text"
        value={todoText} // Controlled component: input value is tied to state.
        onChange={handleChange} // Update state on every input change.
        placeholder="What needs to be done?" // Helpful placeholder text.
        aria-label="New todo item" // Accessibility label for screen readers.
      />
      {/* Button to submit the form. */}
      <button type="submit">
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;