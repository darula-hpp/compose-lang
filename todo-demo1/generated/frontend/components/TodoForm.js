import React, { useState } from 'react';

/**
 * TodoForm component
 * A functional component that provides a form to add new todo items.
 * It manages the input state and handles form submission.
 */
function TodoForm() {
  // State to hold the current value of the todo input field.
  // Initialized as an empty string.
  const [todoText, setTodoText] = useState('');

  /**
   * Handles changes to the todo input field.
   * Updates the `todoText` state with the current value from the input field.
   * This makes the input a "controlled component" in React.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object from the input field.
   */
  const handleInputChange = (event) => {
    setTodoText(event.target.value);
  };

  /**
   * Handles the form submission event.
   * Prevents the default browser form submission behavior (which would cause a page reload).
   * Performs basic validation to ensure the input is not empty.
   * Logs the new todo text to the console and then clears the input field.
   * In a real application, this would typically involve calling a prop function
   * to pass the new todo text to a parent component or a global state management system.
   * @param {React.FormEvent<HTMLFormElement>} event - The submit event object from the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission (page reload)

    // Basic client-side validation: check if the input is empty or just whitespace.
    if (todoText.trim() === '') {
      // Provide user feedback for invalid input.
      // In a production app, this might be a more sophisticated UI notification.
      alert('Todo text cannot be empty!');
      return; // Stop the submission process if validation fails.
    }

    // For demonstration purposes, we log the new todo text.
    // In a real application, you would typically pass this `todoText`
    // to a function provided by a parent component (e.g., `props.onAddTodo(todoText)`).
    console.log('New Todo to add:', todoText);

    // Clear the input field after successful submission.
    setTodoText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input field for entering the todo text */}
      <input
        type="text"
        placeholder="Add a new todo..."
        value={todoText} // Binds the input value to the `todoText` state
        onChange={handleInputChange} // Updates state on every input change
        aria-label="New todo text input" // Provides an accessible label for screen readers
      />
      {/* Button to submit the form and add the todo */}
      <button type="submit">Add Todo</button>
    </form>
  );
}

export default TodoForm;