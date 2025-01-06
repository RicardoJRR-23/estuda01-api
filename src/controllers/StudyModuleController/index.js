const { StudyModule } = require('../../models');

/**
 * Registers a new study module.
 *
 * This function handles study module registration by validating the provided title, description and the topics array
 *
 * @param {Object} req - The Express request object, containing the study module's data in `req.body`.
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 201: Successfully created the notice, returning the notice's ID.
 * - 400: When any validation does not pass
 * - 500: Unexpected server error.
 */
const registerStudyModule = async (req, res) => {
  try {
    // Create a shallow copy of the study module's data from the request body.
    // This avoids mutating the original `req.body` directly.
    const payload = { ...req.body, userId: req.user.id };

    // Create the new user in the database
    const study_module_created = await StudyModule.create(payload);

    return res
      .status(201)
      .json(study_module_created);
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
  registerStudyModule,
}