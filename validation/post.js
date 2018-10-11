const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 10, max: 350 })) {
    errors.text = "Post must be between 10 and 350 characters.";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text is required for post.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
