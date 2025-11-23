import React, { useState } from 'react';
// PropTypes is typically used for prop validation.
// Since this component is specified to have "No props", PropTypes are not needed here.
// If props were introduced, they would be defined using PropTypes.

/**
 * TodoForm component
 * A functional component that provides a form to add new todo items.
 * It manages its own input state and simulates adding a todo.
 *
 * @returns {JSX.Element} The TodoForm component.
 */
function TodoForm() {
  // State to hold the current value of the new todo input field.
  // This makes the input a "controlled component" in React.
  const [newTodoText, setNewTodoText] = useState('');

  /**
   * Handles the form submission event.
   * Prevents the default browser form submission behavior.
   * Performs basic validation and then processes the new todo text.
   * In a real application, this would typically call a prop function
   * (e.g., `onAddTodo(newTodoText)`) to pass the data up to a parent component
   * or a global state management system.
   *
   * @param {Event} event The form submission event object.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the browser from reloading the page

    // Basic validation: Check if the input text is empty or just whitespace.
    if (newTodoText.trim() === '') {
      alert('Todo text cannot be empty!'); // Provide user feedback
      return; // Stop the function if validation fails
    }

    // Simulate adding a todo: log the new todo text to the console.
    // Replace this with actual logic to add a todo (e.g., API call, state update).
    console.log('New Todo Added:', newTodoText);

    // Clear the input field after successful submission.
    setNewTodoText('');
  };

  /**
   * Handles changes to the input field.
   * Updates the `newTodoText` state with the current value of the input field.
   * This ensures the input field always reflects the state.
   *
   * @param {Event} event The input change event object.
   */
  const handleInputChange = (event) => {
    setNewTodoText(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {/* Input field for entering new todo text */}
      <input
        type="text"
        value={newTodoText} // Binds the input value to the component's state
        onChange={handleInputChange} // Updates state on every input change
        placeholder="Add a new todo..."
        aria-label="New todo text" // Provides an accessible label for screen readers
        className="todo-input"
      />
      {/* Button to submit the form and add the todo */}
      <button type="submit" className="todo-add-button">
        Add Todo
      </button>
    </form>
  );
}

// No PropTypes definition needed as the component is specified to have "No props".
// If props were added, PropTypes would be defined here for validation, e.g.:
// TodoForm.propTypes = {
//   onAddTodo: PropTypes.func.isRequired,
// };

export default TodoForm;