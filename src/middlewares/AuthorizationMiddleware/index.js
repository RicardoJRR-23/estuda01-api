const authenticationTokenUtil = require('../../utils/authenticationToken');

/**
 * Sends a 401 Unauthorized response with a custom message
 * 
 * @param {object} res - The response object from Express.js.
 * @param {string} message - The message to send to the client.
 * @returns {object} Express.js response with a 401 status and error message.
 */
const returnUnauthorizedResponse = (res, message) => {
  return res
    .status(401)
    .json({
      error: message // Responds with the custom error message provided.
    });
};

/**
 * Middleware to validate the JWT sent in the Authorization header.
 *
 * The middleware checks for a valid Bearer token in the Authorization header,
 * verifies the token using the `authenticationTokenUtil` utility, and attaches
 * the decoded payload to the `req.user` object for use in subsequent middleware or routes.
 *
 * If the token is missing, invalid, expired, or not in the correct format, it sends a
 * 401 Unauthorized response with an appropriate message. If an unexpected error occurs,
 * a 500 Internal Server Error is sent.
 *
 * @param {object} req - The Express.js request object.
 * @param {object} req.headers - The headers of the request.
 * @param {string} [req.headers.authorization] - The Authorization header, expected in the format: "Bearer {token}".
 * @param {object} res - The Express.js response object.
 * @param {function} next - Callback to invoke the next middleware in the stack.
 * @returns {void|object} Calls `next()` if the token is valid; otherwise, sends an error response.
 *
 */
module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization; // Extracts the Authorization header.

    // Checks if the Authorization header exists.
    if (!authorization) {
      return returnUnauthorizedResponse(res, 'Token não foi enviado.'); // Responds with 401 if absent.
    }

    const [, token] = authorization.split(' '); // Splits the header value into "Bearer" and the token.

    // Checks if the token part of the header exists.
    if (!token) {
      return returnUnauthorizedResponse(res, 'Não é uma Bearer token.'); // Responds with 401 if the format is incorrect.
    }

    // Verifies the token using the utility function.
    const payload = await authenticationTokenUtil.verify(token);

    // Stores the payload (decoded token data) in `req.user` for later use in the request lifecycle.
    req.user = payload;

    return next(); // Calls the next middleware if verification succeeds.
  } catch (error) {
    console.error('Error: ', error); // Logs the error for debugging purposes.

    // Handles specific errors from `authenticationTokenUtil`.
    if (error instanceof authenticationTokenUtil.errors.InvalidTokenError) {
      return returnUnauthorizedResponse(res, 'Token não é válido.'); // 401 for invalid token.
    }
    else if (error instanceof authenticationTokenUtil.errors.ExpiredTokenError) {
      return returnUnauthorizedResponse(res, 'Token expirado.'); // 401 for expired token.
    }

    // General error handling for unexpected issues.
    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};
