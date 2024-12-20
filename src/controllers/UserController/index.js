const { User } = require('../../models');
const passwordEncryption = require('../../utils/passwordEncryption');

/**
 * Registers a new user.
 *
 * This function handles user registration by validating the provided email,
 * encrypting the password, and storing the user data in the database.
 *
 * @param {Object} req - The Express request object, containing the user's data in `req.body`.
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 201: Successfully created the user, returning the user's ID.
 * - 409: Email already exists, registration conflict.
 * - 500: Unexpected server error.
 */
const registerUser = async (req, res) => {
  try {
    // Create a shallow copy of the user's data from the request body.
    // This avoids mutating the original `req.body` directly.
    const payload = { ...req.body };

    // Check if an account with the same email already exists
    const user_with_duplicated_email = await User.findOne({ email: payload.email });

    if (user_with_duplicated_email) {
      // Email is already registered, send a conflict response
      return res
        .status(409)
        .json({
          error: 'Este email já foi registrado.'
        });
    }

    // Encrypt the user's password before storing it
    const password = await passwordEncryption.encrypt(payload.password);

    // Create the new user in the database
    const user_created = await User.create({
      ...payload,
      password 
    });

    return res
      .status(201)
      .json({ id: user_created._id.toString() });
  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};

/**
 * Handles the retrieval of a user's information.
 * 
 * This function checks if the user ID from the request matches either "me" or the ID
 * of the currently authenticated user. If it doesn't match, a 403 Forbidden response 
 * is returned. On success, the user's data is returned.
 *
 * @async
 * @function getUser
 * @param {Object} req - The request object from Express.js, containing:
 *    - `params.userId`: The ID of the user requested (e.g., "me" or a specific ID).
 *    - `user`: The authenticated user's information.
 * @param {Object} res - The response object from Express.js used to send HTTP responses.
 * @returns {Object} JSON response with the user's information or an error message.
 */
const getUser = async (req, res) => {
  try {
    // Extract the requested user ID from the route parameters.
    const user_id = req.params.userId;

    // Validate if the requested user ID is either "me" or matches the authenticated user's ID.
    // If it doesn't match, return a 403 Forbidden response with an error message.
    if (user_id !== 'me' && user_id !== req.user.id) {
      return res.status(403).json({
        error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.',
      });
    }

    // If the validation passes, send back the user's information.
    return res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });

  } catch (error) {
    // Log any unexpected errors to the server console for debugging purposes.
    console.error('Unexpected Error: ', error);

    // Respond with a 500 Internal Server Error and a generic error message.
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
  }
};

module.exports = {
  registerUser,
  getUser
}