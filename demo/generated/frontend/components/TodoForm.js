import React, { useState } from 'react';
// import PropTypes from 'prop-types'; // PropTypes are not needed as this component does not accept any props.

/**
 * TodoForm Component
 * A functional component that provides a form to add new todo items.
 * It manages its own input state and handles form submission.
 */
function TodoForm() {
  // State to hold the current value of the todo input field.
  // The initial state is an empty string.
  const [todoText, setTodoText] = useState('');

  /**
   * Handles changes to the todo input field.
   * This function is called every time the input value changes,
   * ensuring the component's state is always in sync with the input field.
   * @param {Object} e - The event object from the input change.
   */
  const handleInputChange = (e) => {
    setTodoText(e.target.value);
  };

  /**
   * Handles the form submission event.
   * Prevents the default browser form submission behavior.
   * Performs basic validation, logs the todo text, and clears the input.
   * In a production application, this would typically involve:
   * 1. Calling a prop function passed from a parent component to add the todo.
   * 2. Dispatching an action to a global state management system (e.g., Redux, Context API).
   * 3. Sending the todo item to a backend API.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload)

    // Basic client-side validation: check if the input is empty or just whitespace.
    if (todoText.trim() === '') {
      // Provide user feedback for empty input.
      // In a more complex app, this might be a visual error message on the form.
      alert('Please enter a todo item before adding.');
      return; // Stop the submission process if validation fails.
    }

    // Simulate adding a todo item.
    // In a real application, replace this console.log with actual logic
    // to add the todo to your application's state or a backend.
    console.log('New Todo Added:', todoText);

    // Clear the input field after successful submission.
    setTodoText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {/* Input field for entering the todo description */}
      <input
        type="text"
        className="todo-input"
        placeholder="What needs to be done?"
        value={todoText} // Makes this a controlled component, value is driven by state
        onChange={handleInputChange} // Updates state on every input change
        aria-label="New todo item description" // Provides accessibility for screen readers
      />
      {/* Button to submit the form and add the todo */}
      <button type="submit" className="todo-button">