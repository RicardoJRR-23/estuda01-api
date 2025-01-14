/**
 * Middleware to validate the request body against a Joi schema.
 *
 * This function returns a middleware function that validates the `req.body`
 * against the provided Joi schema. If the validation fails, it sends a 400
 * response with the error message. If an unexpected error occurs, it sends a
 * 500 response with a generic error message.
 *
 * @param {Object} schema - The Joi schema to validate the request body against.
 * @returns {Function} Middleware function for request validation.
 *
 * @example
 * const Joi = require('joi');
 * const ValidateSchemaMiddleware = require('./path-to-this-file');
 *
 * const schema = Joi.object({
 *   username: Joi.string().required(),
 *   password: Joi.string().min(6).required(),
 * });
 *
 * app.post('/login', validateSchemaMiddleware(schema), (req, res) => {
 *   res.send('Logged in successfully!');
 * });
 */
const validateSchemaMiddleware = schema => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false, to return all errors

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    return next();
  } catch (err) {
    console.error('Unexpected Error:', err);

    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

module.exports = validateSchemaMiddleware;
