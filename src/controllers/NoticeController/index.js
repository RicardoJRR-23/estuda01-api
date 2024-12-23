const { Notice } = require('../../models');

/**
 * Registers a new notice.
 *
 * This function handles notice registration by validating the provided title, description,
 * link and publishedDate and storing data in the database.
 *
 * @param {Object} req - The Express request object, containing the notice's data in `req.body`.
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 201: Successfully created the notice, returning the notice's ID.
 * - 500: Unexpected server error.
 */
const registerNotice = async (req, res) => {
  try {
    // Create a shallow copy of the notice's data from the request body.
    // This avoids mutating the original `req.body` directly.
    const payload = { ...req.body, userId: req.user.id };

    // Create the new user in the database
    const notice_created = await Notice.create(payload);

    return res
      .status(201)
      .json({ id: notice_created._id.toString() });
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
  registerNotice,
}