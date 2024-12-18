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


module.exports = {
  registerUser
}