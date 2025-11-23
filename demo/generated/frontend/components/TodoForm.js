import React, { useState } from 'react';
// No PropTypes needed as the component does not accept any props.
// import PropTypes from 'prop-types'; // Uncomment if props are added later.

/**
 * TodoForm Component
 * A functional React component that provides a form to add new todo items.
 * It manages its own state for the new todo input.
 *
 * @returns {JSX.Element} The TodoForm component.
 */
function TodoForm() {
  // State to hold the current value of the new todo input field.
  // The initial state is an empty string.
  const [newTodo, setNewTodo] = useState('');

  /**
   * Handles changes to the input field.
   * Updates the 'newTodo' state with the current value of the input.
   * This makes the input a controlled component.
   *
   * @param {Object} event - The change event object from the input field.
   */
  const handleInputChange = (event) => {
    setNewTodo(event.target.value);
  };

  /**
   * Handles the form submission.
   * Prevents the default form submission behavior (page reload).
   * Performs basic validation: if the input is not empty, it logs the new todo
   * and then clears the input field.
   * In a real application, this would typically dispatch an action to add the todo
   * to a global state management system (e.g., Redux, Context API) or make an API call.
   *
   * @param {Object} event - The submit event object from the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Basic validation: ensure the input is not empty or just whitespace
    if (newTodo.trim()) {
      // In a real application, you would pass this 'newTodo' value
      // to a parent component via a prop function, or dispatch an action.
      // For this example, we'll just log it to the console.
      console.log('New Todo Added:', newTodo.trim());

      // Clear the input field after submission
      setNewTodo('');
    } else {
      // Optionally, provide user feedback for empty input
      console.warn('Todo item cannot be empty.');
      // You might set an error state here to display a message to the user
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h2 className="todo-form__title">Add New Todo</h2>
      <div className="todo-form__group">
        <label htmlFor="new-todo-input" className="todo-form__label">
          Todo Description:
        </label>
        <input
          type="text"
          id="new-todo-input"
          className="todo-form__input"
          value={newTodo} // Controlled component: input value is tied to state
          onChange={handleInputChange} // Update state on every change
          placeholder="e.g., Buy groceries"
          aria-label="New todo description"
          required // HTML5 validation: input is required
        />
      </div>
      <button type="submit" className="todo-form__button">
        Add Todo
      </button>
    </form>
  );
}

// No PropTypes definition needed as there are no props.
// TodoForm.propTypes = {}; // Uncomment and define if props are added.

export default TodoForm;