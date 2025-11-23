import PropTypes from 'prop-types';

const TodoPropTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
};

export default TodoPropTypes;