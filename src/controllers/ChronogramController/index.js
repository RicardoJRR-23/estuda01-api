const { Chronogram } = require('../../models');


/**
 * @description
 * This file contains the controllers for the Chronogram entity.
 * and the services that communicate with the database.
 */

//Controllers
// Responsible for the communication between the routes and the services


/**
 * @function createController
 * @function createController
 * @description
 * This file contains the controllers for the Chronogram entity.
 * and the services that communicate with the database.
 */

//Controllers
// Responsible for the communication between the routes and the services

/**
 * @function createController
 * @description
 *  This function creates a chronogram
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * (if success in creating the cronogram)
 *  code: 201
 *    body: {
 *      chronogram: chronogram <Chronogram>
 *    }
 *
 * (if something unexpected happpened while creating the cronogram)
 *
 *  code: 500
 *    body: {
 *      error: "Erro ao criar chronogram. Erro interno do servidor"
 *    }
 *
 */

const createController = async (req, res) => {
  try {
    // Gets the chronogram data from the request body, which was validated by the middleware
    // see src/routes/private/chronogram/chronogram_form_schema.js
    const chronogram_data = { ...req.body, userId: req.user.id };
    console.info('Starting to create chronogram...');
    // Creates chronogram
    const chronogram = await createService(chronogram_data);

    //Everything went well, it returns the created chronogram
    return res.status(201).json(chronogram);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erro ao criar cronograma. Erro interno do servidor'
    });
  }
};

/**
 * @function findController
 * @description
 * This function searches for a chronogram by its 'id',
 * find all chronograms or by 'userId'
 *
 * The base params for all the functions are:
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * (if success in finding the cronogram)
 *
 *  code: 200
 *    body: {
 *      chronogram: chronogram <Chronogram>
 *    }
 *
 * (if something unexpected happpened while trying to find the chronogram)
 *
 *  code: 500
 *    body: {
 *      error: 'Erro ao buscar cronograma. Erro interno do servidor'
 *    }
 *
 *
 */

const findByUserIdController = async (req, res) => {
  try {
    // Extract the requested user ID from the route parameters.
    const user_id = req.user.id;

    const chronograms = await findByUserIdService(user_id);
    return res.status(200).json(chronograms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

/**
 * @function findController
 * @description
 * This function searches for a chronogram by its 'id',
 * find all chronograms or by 'userId'
 *
 * The base params for all the functions are:
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * (if success in finding the cronogram)
 *
 *  code: 200
 *    body: {
 *      chronogram: chronogram <Chronogram>
 *    }
 *
 * (if something unexpected happpened while trying to find the chronogram)
 *
 *  code: 500
 *    body: {
 *      error: 'Erro ao buscar cronograma. Erro interno do servidor'
 *    }
 *
 *
 */


const findByIdController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { chronogram_id } = req.params;

    const chronogram = await findByUserIdAndIdService(user_id, chronogram_id);

    // If the chronogram is not found, return a 404 Not Found response
    if (chronogram.length === 0 || !chronogram) {
      return res.status(404).json({
        error: 'Cronograma não encontrado.'
      });
    }
    return res.status(200).json(chronogram);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

/**
 * @function putController
 * @description
 * Updates an existing chronogram with the provided data. It first verifies if the chronogram
 * belongs to the authenticated user and exists. If it does, it applies the updates.
 * Handles various error scenarios and sends appropriate HTTP responses.
 *
 * @param {Object} req - The request object containing the user ID in `req.user.id`,
 *                       the chronogram ID in `req.params.chronogram_id`, and the update data in `req.body`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the chronogram is updated successfully.
 *  - 404: If the chronogram is not found or does not belong to the user.
 *  - 400: If there is a validation error in the update data.
 *  - 500: If an unexpected server error occurs.
 */

const putController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { chronogram_id } = req.params;
    const update_payload = req.body;
    const found = await findByUserIdAndIdService(user_id, chronogram_id);

    if (found.length === 0) {
      return res.status(404).json({
        error: 'Cronograma não encontrado.'
      });
    }

    const response = await totalUpdateService(chronogram_id, update_payload);
    console.info('Chronogram updated successfully.');
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};
/**
 * Handles PATCH requests to update specific fields of a chronogram by its ID.
 *
 * @function patchController
 * @param {Object} req - The request object containing the user ID in `req.user.id`,
 *                       the chronogram ID in `req.params.chronogram_id`, and the update data in `req.body`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the chronogram is updated successfully.
 *  - 404: If the chronogram is not found or does not belong to the user.
 *  - 400: If there is a validation error in the update data.
 *  - 500: If an unexpected server error occurs.
 */
const patchController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { chronogram_id } = req.params;
    const update_payload = req.body;
    const found = await findByUserIdAndIdService(user_id, chronogram_id);

    if (found.length === 0) {
      return res.status(404).json({
        error: 'Cronograma não encontrado.'
      });
    }

    const response = await parcialUpdateService(chronogram_id, update_payload);
    console.info('Chronogram updated successfully.');
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};


/**
 * @function deleteController
 * @description
 * Deletes an existing chronogram that belongs to the authenticated user.
 * Handles various error scenarios and sends appropriate HTTP responses.
 *
 * @param {Object} req - The Express request object, containing the user ID in `req.user.id` and the chronogram ID in `req.params.chronogram_id`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the chronogram is deleted successfully.
 *  - 404: If the chronogram is not found or does not belong to the user.
 *  - 500: If an unexpected server error occurs.
 */
const deleteController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { chronogram_id } = req.params;
    const found = await findByUserIdAndIdService(user_id, chronogram_id);

    if (found.length === 0) {
      return res.status(404).json({
        error: 'Cronograma não encontrado.'
      });
    }

    await deleteService(chronogram_id);
    console.info('Chronogram deleted successfully.');
    return res.status(200).json({ message: 'Cronograma apagado com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

module.exports = {
  createController,
  findByUserIdController,
  findByIdController,
  putController,
  patchController,
  deleteController
};

// Services
// Responsible for the communication with the database

/**
 * Creates a new chronogram in the database.
 *
 * @async
 * @function createService
 * @param {Object} chronogram_data - An object containing the data to create the chronogram.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the newly created chronogram object.
 */
async function createService(chronogram_data) {
  return Chronogram.create(chronogram_data);
}


/**
 * Finds all chronograms that belong to the authenticated user.
 *
 * @async
 * @function findByUserIdService
 * @param {string} user_id - The ID of the user.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to an array of chronogram objects that belong to the user, or an empty array if none are found.
 */
async function findByUserIdService(user_id) {
  return Chronogram.find({ userId: user_id });
}
/**
 * Finds a chronogram by its ID and verifies if it belongs to the authenticated user.
 *
 * @async
 * @function findByUserIdAndIdService
 * @param {string} user_id - The ID of the user.
 * @param {string} chronogram_id - The ID of the chronogram.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to an array containing the chronogram object if found, or an empty array if not found.
 */
async function findByUserIdAndIdService(user_id, chronogram_id) {
  return Chronogram.find({ _id: chronogram_id, userId: user_id });
}

/**
 * Updates a chronogram document in the database, replacing all fields with the provided data.
 *
 * @async
 * @function totalUpdateService
 * @param {string} chronograma_id - The ID of the chronogram to be updated.
 * @param {Object} chronogram_data - An object containing the fields to update with their new values.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the updated chronogram object.
 */
async function totalUpdateService(chronograma_id, chronogram_data) {
  return Chronogram.findByIdAndUpdate(chronograma_id, chronogram_data, {
    new: true
  });
}
/**
 * Updates specific fields of a chronogram document in the database.
 *
 * @async
 * @function parcialUpdateService
 * @param {string} chronograma_id - The ID of the chronogram to be updated.
 * @param {Object} chronogram_data - An object containing the fields to update with their new values.
 *
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the updated chronogram object if found, or null if not found.
 */

async function parcialUpdateService(chronograma_id, chronogram_data) {
  return Chronogram.findByIdAndUpdate(
    chronograma_id,
    { $set: chronogram_data },
    {
      new: true
    }
  );
}

/**
 * Deletes a chronogram by its ID from the database.
 *
 * @async
 * @function deleteService
 * @param {string} chronogram_id - The ID of the chronogram to be deleted.
 *
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the deleted chronogram object if found, or null if not found.
 */

async function deleteService(chronogram_id) {
  return Chronogram.findByIdAndDelete(chronogram_id);
}


