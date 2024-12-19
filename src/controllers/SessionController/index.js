const { User } = require('../../models');
const authenticationTokenUtil = require('../../utils/authenticationToken');
const passwordEncryption = require('../../utils/passwordEncryption');

/**
 * Sends a 401 Unauthorized response with a predefined error message.
 * 
 * @param {object} res - The response object from Express.js.
 * @returns {object} Express.js response with a 401 status and error message.
 */
const returnUnauthorizedResponse = (res) => {
  return res
    .status(401)
    .json({
      error: 'Credenciais inválidas.'
    });
};

/**
 * Creates a session for the user by validating credentials and generating an access token.
 * 
 * @param {object} req - The request object from Express.js.
 * @param {object} req.body - The request body containing user credentials.
 * @param {string} req.body.email - The email address of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {object} res - The response object from Express.js.
 * @returns {object} Express.js response with either an access token (201 status) or an error message.
 */
const createSession = async (req, res) => {
  try {
    const { email, password } = req.body; // Extract email and password from request body

    // Attempt to find a user by their email
    const user = await User.findOne({ email });

    // If no user is found, send unauthorized response
    if (!user) {
      return returnUnauthorizedResponse(res);
    }

    // Compare the provided password with the hashed password in the database
    const does_passwords_match = await passwordEncryption.compare(
      password,
      user.password
    );

    // If passwords do not match, send unauthorized response
    if (!does_passwords_match) {
      return returnUnauthorizedResponse(res);
    }

    // Generate an access token containing user details
    const access_token = authenticationTokenUtil.generate({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Send a 201 response with the access token
    return res
      .status(201)
      .json({ access_token });

  } catch (error) {
    // Log any unexpected errors to the console
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};

module.exports = {
  createSession
};
