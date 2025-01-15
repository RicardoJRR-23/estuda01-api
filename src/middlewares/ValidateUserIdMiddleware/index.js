/**
 * Middleware to validate if the userId provided corresponds to the authenticated one
 *
 * @example
 * {
 *    error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.'
 * }
 *
 * @param {object} req - The Express.js request object containing the user details.
 * @param {string} [req.params.userId] - The userId that should correspond to the authenticated user
 * @param {object} res - The Express.js response object.
 * @param {function} next - Callback to invoke the next middleware in the stack or the route controller.
 * @returns {void|object} Calls `next()` if userId matches the authenticated user.
 *
 */
const ValidateUserIdMiddleware = (req, res, next) => {
  try {
    const user_id = req.params.userId;

    // Validate if the requested user ID is either "me" or matches the authenticated user's ID.
    // If it doesn't match, return a 403 Forbidden response with an error message.
    if (user_id !== 'me' && user_id !== req.user.id) {
      return res.status(403).json({
        error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.',
      });
    }

    return next();
  } catch (err) {
    console.error('Unexpected Error:', err);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};

module.exports = ValidateUserIdMiddleware;
