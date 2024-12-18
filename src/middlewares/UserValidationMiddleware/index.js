const schema = require('./schema');

/**
 * Middleware for user data validation.
 *
 * Validates the request body according to the defined schema, ensuring that the fields
 * `name`, `email`, `password`, and optionally, `role`, are provided and adhere to the specified rules.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the data to be validated.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function in the chain.
 *
 * @throws {Error} Returns a specific error message if:
 * - The request body does not meet the schema requirements.
 * - An unexpected error occurs during the validation process.
 *
 * @returns {Object|void} - Responds with:
 * - **400**: If the provided data is invalid, including custom messages for each field.
 * - **500**: If an unexpected error occurs.
 * - Calls `next()` if the data is valid.
 *
 * ### Expected Structure:
 * ```json
 * {
 *   "name": "string, required",
 *   "email": "string, required, must be a valid email",
 *   "password": "string, required, minimum 6 characters",
 *   "role": "string, optional, must be one of the values defined in USER_ROLES"
 * }
 * ```
 *
 * ### Examples of Error Messages:
 * - `"The 'name' field is missing."`
 * - `"The provided email is not valid."`
 * - `"The password must contain at least 6 characters."`
 * - `"The value of the 'role' field must be one of the strings {role1 or role2 or roleN}."`
 */
module.exports = (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({
          error: error.message
        });
    }

    return next();
  } catch(err) {
    console.error('Unexpected Error:', err);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      })
  }
}