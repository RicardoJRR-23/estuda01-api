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
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

/**
 * Handles the update process of a user's name and email
 *
 * @async
 * @function updateUser
 * @param {Object} req - The request object from Express.js, containing:
 *    - `params.userId`: The ID of the user requested (e.g., "me" or a specific ID).
 *    - `user`: The authenticated user's information.
 *    - `body`: The user email and name to update
 * @param {Object} res - The response object from Express.js used to send HTTP responses.
 * @returns {Object} a status code 204 indicating the success of the update process
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    const user = await User.findOne({ email: payload.email });

    if (user && user._id.toString() !== userId) {
      return res
        .status(400)
        .json({
          error: 'Este email não pode ser registrado para este usuário.'
        });
    }

    await User.updateOne({ _id: userId }, { $set: payload });

    return res.status(204).send()
  } catch (error) {
    // Log any unexpected errors to the server console for debugging purposes.
    console.error('Unexpected Error: ', error);

    // Respond with a 500 Internal Server Error and a generic error message.
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
  }
};

/**
 * Handles the update process of a user's password
 *
 * @async
 * @function updateUserPassword
 * @param {Object} req - The request object from Express.js, containing:
 *    - `params.userId`: The ID of the user requested (e.g., "me" or a specific ID).
 *    - `user`: The authenticated user's information.
 *    - `body`: The user password to updated and the currentPassword to match the stored one
 * @param {Object} res - The response object from Express.js used to send HTTP responses.
 * @returns {Object} a status code 204 indicating the success of the update process
 */
const updateUserPassword = async (req, res) => {
  try {
    const payload = req.body;

    const user = await User.findById(req.user.id);

    // Compare the provided password with the hashed password in the database
    const does_passwords_match = await passwordEncryption.compare(
      payload.currentPassword,
      user.password
    );

    // If passwords do not match, send unauthorized response
    if (!does_passwords_match) {
      return res
        .status(400)
        .json({
          error: 'Campo "currentPassword" não corresponde ao password armazenado.'
        });
    }

    const password_encrypted = await passwordEncryption.encrypt(payload.password);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: {
          password: password_encrypted
        } 
      }
    );

    return res.status(204).send()
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
  getUser,
  updateUser,
  updateUserPassword
}