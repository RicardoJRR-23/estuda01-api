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
 * - 201: Successfully created the study module returning its full details.
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


/**
 * Get a list of study modules from an authenticated user
 *
 * @param {Object} req - The Express request object, containing the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response. 
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 200: Study modules successfuly returned
 * - 500: Unexpected server error.
 */
const fetchStudyModules = async (req, res) => {
  try {
    const study_modules = await StudyModule.find({ userId: req.user.id });

    return res
      .status(200)
      .json(study_modules || []);
  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

/**
 * Get a study module that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the studyModuleId on the params attribute and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 200: Study module successfuly returned
 * - 404: When the study module is not found
 * - 500: Unexpected server error.
 */
const fetchStudyModule = async (req, res) => {
  try {
    const study_module = await StudyModule.findById(req.params.studyModuleId);

    if (!study_module || study_module?.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({
          error: 'Módulo de Estudo não encontrado.'
        });
    }
  
    return res
      .status(200)
      .json(study_module);
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
 * Fully updates a study module that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the studyModuleId on the params attribute, the body request payload containing the details and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204: Study module successfuly updated
 * - 404: When the study module is not found
 * - 500: Unexpected server error.
 */
const updateStudyModule = async (req, res) => {
  try {
    const id = req.params.studyModuleId;

    let study_module = await StudyModule.findById(id);

    if (!study_module || study_module?.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({
          error: 'Módulo de Estudo não encontrado.'
        });
    }

    const payload = req.body;
    payload.updatedAt = Date.now();

    await StudyModule.updateOne({ _id: id }, payload);

    return res
      .status(204)
      .send();
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
 * Partially updates a study module that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the studyModuleId on the params attribute, the body request payload containing the details and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204: Study module successfuly patched
 * - 404: When the study module is not found
 * - 500: Unexpected server error.
 */
const patchStudyModule = async (req, res) => {
  try {
    const id = req.params.studyModuleId;

    let study_module = await StudyModule.findById(id);

    if (!study_module || study_module?.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({
          error: 'Módulo de Estudo não encontrado.'
        });
    }

    const payload = req.body;

    await StudyModule.updateOne({ _id: id }, { $set: payload });

    return res
      .status(204)
      .send();
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
 * Deletes a study module that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the studyModuleId on the params attribute and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204: Study module successfuly deleted
 * - 404: When the Study module is not found
 * - 500: Unexpected server error.
 */
const deleteStudyModule = async (req, res) => {
  try {
    const id = req.params.studyModuleId;

    let study_module = await StudyModule.findById(id);

    if (!study_module || study_module?.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({
          error: 'Módulo de Estudo não encontrado.'
        });
    }

    await StudyModule.deleteOne({ _id: id });

    return res
      .status(204)
      .send();

  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

module.exports = {
  fetchStudyModule,
  patchStudyModule,
  fetchStudyModules,
  updateStudyModule,
  deleteStudyModule,
  registerStudyModule,
}