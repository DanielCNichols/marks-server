const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegistrationInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.username = !isEmpty(data.username) ? data.username : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.confirmPass = !isEmpty(data.confirmPass) ? data.confirmPass : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = 'Username is required';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password is required';
  }

  if (Validator.isEmpty(data.confirmPass)) {
    errors.confirmPass = 'Confirm password is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'Password must be between 6 and 30 characters';
  }

  if (!Validator.equals(data.password, data.confirmPass)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
