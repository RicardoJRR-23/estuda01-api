const { USER_ROLES } = require('../../utils/constants');

/**
 * Middleware to validate if the authenticated user is an ADMIN
 *
 * The middleware checks if the user payload that is passed to the request by
 * the AuthorizationMiddleware has a role admin if it does the middleware passes
 * to the route controller or the next middleware else it returns 403 and the following response body:
 * @example
 * {
 *    error: 'Você não tem permissão para aceder a essa rota.'
 * }
 *
 * @param {object} req - The Express.js request object containing the user details.
 * @param {string} [req.headers.user] - The user details payload that contains the role attribute
 * @param {object} res - The Express.js response object.
 * @param {function} next - Callback to invoke the next middleware in the stack or the route controller.
 * @returns {void|object} Calls `next()` if the authenticated user is an admin; otherwise, sends an error response.
 *
 */
module.exports = (req, res, next) => {
  try {
    // Retrieves the role by the user details payload from the request object
    const user_role = req.user.role;

    // validates if the user is an admin, else it returns an error to the client
    if (user_role !== USER_ROLES.admin) {
      return res
        .status(403)
        .json({
          error: 'Não tem permissão para aceder a essa rota.'
        });
    }

    // If gets here, it means that user is allowed(admin)
    next();
  } catch (error) {
    console.error('Error: ', error); // Logs the error for debugging purposes.

    // General error handling for unexpected issues.
    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};