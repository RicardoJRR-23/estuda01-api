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
    const chronogram_data = req.body;

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
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * (if success in finding the cronogram)
 *
 *  code: 200
 *    body: {
 *      chronogram <Object of Chronogram>
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
 *
 * @function findByIdController
 * @description
 * This function searches for a chronogram by its 'id'
 * 
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 * 
 * @returns response. status(code).json(body)
 * 
 * (if success in finding the cronogram)
 * 
 *  code: 200
 *    body: {
 *      chronogram <Object of Chronogram>
 *    }
 *
 * (If not finding the chronogram)
 * 
 *  code: 404
 *    body: {
 *      error: 'Cronograma não encontrado.'
 *    }
 *  
 * (if something unexpected happpened while trying to find the chronogram)
 * 
 *  code: 500
 *    body: {
 *      error: 'Erro ao buscar cronograma. Erro interno do servidor'
 *    }
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

module.exports = {
  createController,
  findByUserIdController,
  findByIdController
};

// Services
// Responsible for the communication with the database

async function createService(chronogram_data) {
  return Chronogram.create(chronogram_data);
}

async function findByUserIdService(user_id) {
  return Chronogram.find({ userId: user_id });
}
async function findByUserIdAndIdService(user_id, chronogram_id) {
  return Chronogram.find({ _id: chronogram_id, userId: user_id });
}

//TODO Implement the other services for future controllers to make
/*
async function UpdateService(chronograma_id, chronogram_data) {
  return Chronogram.findByIdAndUpdate(chronograma_id, chronogram_data, {
    new: true
  });
}

async function DeleteService(chronograma_id) {
  return Chronogram.findByIdAndDelete(chronograma_id);
}
*/
