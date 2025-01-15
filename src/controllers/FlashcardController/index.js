const { Flashcard, User } = require('../../models');
const mongoose = require('mongoose');
/**
 * @function createOneOrManyController
 * @description
 *  This function creates multiple flashcards
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * - 201: if success in creating the flashcard
 *  example:
 *    body: {
 *      flashcards: flashcards <Array<Flashcard>>
 *    }
 *
 * - 400: if the payload is not an array or is empty
 *  example:
 *    body: {
 *      error: "O campo "answer" deve ser do tipo String."
 *    }
 *
 * - 500: if something unexpected happpened while creating the flashcards
 *  example:
 *    body: {
 *      error: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 *    }
 *
 */
const createOneOrManyController = async (req, res) => {
  try {
    //*  if the payload is an Array and has at least 2 elements
    if (Array.isArray(req.body) && req.body.length > 1) {
      const flashcard_payload = req.body.map(flashcard_data => ({
        ...flashcard_data,
        userId: req.user.id
      }));

      const flashcards = await createManyService(flashcard_payload);

      return res.status(201).json(flashcards);
      //* else, it should be an Object
    } else {
      const flashcard_payload = {
        ...req.body,
        userId: req.user.id
      };
      const flashcard = await createService(flashcard_payload);

      return res.status(201).json(flashcard);
    }
  } catch (error) {
    if (error.name === 'SyntaxError') {
      return res.status(400).json({ error: error });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

/**
 * @function findAllController
 * @description
 *  This function gets all flashcards.
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *
 * - 200: if the flashcards were found
 *  example:
 *    body: {
 *      flashcards: flashcards <Array<Flashcard>>
 *    }
 *
 * - 500: if something unexpected happpened while fetching the flashcards
 *  example:
 *    body: {
 *      error: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 *    }
 *
 */
const findAllController = async (req, res) => {
  try {
    const flashcards = await findAllService();

    if (flashcards.length === 0) {
      return res.status(404).json({
        error: 'Nenhuma flashcard encontrada.'
      });
    }

    if (flashcards.length === 1) {
      return res.status(200).json({
        total: flashcards.length,
        flashcard: flashcards[0]
      });
    } else if (flashcards.length > 1) {
      return res.status(200).json({
        total: flashcards.length,
        flashcards
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};

/**
 * @function findByIdController
 * @description
 *  This function returns a flashcard based on its ID.
 *  Handles various error scenarios and sends appropriate HTTP responses.
 *
 * @param {Object} req - The request object containing the flashcard ID in `req.params.flashcardId`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the flashcard is found and belongs to the user.
 *  - 400: If the flashcardId is invalid.
 *  - 404: If the flashcard is not found.
 *  - 500: If an unexpected server error occurs.
 */
const findByIdController = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    if (
      !flashcardId ||
      !mongoose.Types.ObjectId.isValid(flashcardId) ||
      flashcardId.length !== 24 ||
      flashcardId === null
    ) {
      return res.status(400).json({ message: 'FlashcardId inválido.' });
    }
    const flashcard = await findByIdService(flashcardId);
    if (!flashcard) {
      return res
        .status(404)
        .json({ message: 'O flashcard não foi encontrado' });
    } else {
      if (flashcard.userId.toString() === req.user.id) {
        //TODO  aplicar possível redirect return res.redirect('/nova-pagina');
        return res.status(200).json({ message: 'É meu flashcard', flashcard });
      } else {
        //TODO  aplicar possível redirect return res.redirect('/nova-pagina');
        return res.status(200).json({
          message: 'Não é meu flashcard',
          flashcard
        });
      }
    }
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
 *  Updates a flashcard by its ID, ensuring it belongs to the authenticated user.
 *  Validates the request payload and handles various error scenarios.
 *
 * @param {Object} req - The request object containing the user ID in `req.user.id`,
 *                       flashcard ID in `req.params.flashcardId`, and update payload in `req.body`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the flashcard is successfully updated.
 *  - 400: If the payload is invalid or a validation error occurs.
 *  - 404: If the flashcard is not found.
 *  - 500: If an unexpected server error occurs.
 */

const putController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { flashcardId } = req.params;
    const update_payload = req.body;

    if (!update_payload.subject) {
      update_payload.subject = null;
    }

    const response = await totalUpdateService(
      flashcardId,
      user_id,
      update_payload
    );
    if (!response) {
      return res.status(404).json({
        error: `O Flashcard não foi encontrado.`
      });
    }

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
 * @function patchController
 * @description
 *  Updates specific fields of a flashcard by its ID, ensuring it belongs to the authenticated user.
 *  Validates the request payload and handles various error scenarios.
 *
 * @param {Object} req - The request object containing the user ID in `req.user.id`,
 *                       flashcard ID in `req.params.flashcardId`, and update payload in `req.body`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the flashcard is successfully updated.
 *  - 400: If the payload is invalid or a validation error occurs.
 *  - 404: If the flashcard is not found.
 *  - 500: If an unexpected server error occurs.
 */

const patchController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { flashcardId } = req.params;
    const update_payload = req.body;


    const response = await specificUpdateService(
      flashcardId,
      user_id,
      update_payload
    );
    if (!response) {

      return res.status(404).json({
        error: `O Flashcard não foi encontrado.`
      });
    }
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
 *  Deletes a flashcard by its ID if owned by user or if the user is an admin.
 *  Handles various error scenarios and sends appropriate HTTP responses.
 *
 * @param {Object} req - The request object containing the user ID in `req.user.id` and
 *                       flashcard ID in `req.params.flashcardId`.
 * @param {Object} res - The response object used to send back the HTTP response.
 *
 * @returns {Object} - Returns a JSON response with a status code:
 *  - 200: If the flashcard is successfully deleted.
 *  - 403: If the user is not authorized to delete the flashcard.
 *  - 404: If the flashcard is not found.
 *  - 500: If an unexpected server error occurs.
 */
const deleteController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;
    const { flashcardId } = req.params;

    const found = await findByIdService(flashcardId);
    if (!found) {
      return res.status(404).json({
        error: `O Flashcard não foi encontrado.`
      });
    }
   

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        error: `O utilizador nao foi encontrado.`
      });
    }

    const IsNotAdmin = user.role !== 'admin' && user_role !== 'admin';
    const isNotOwner = found.userId.toString() !== user_id;
    if (user.role !== user_role) {
      console.log('FALHA GRAVE');
      return res.status(403).json({
        error: `O utilizador nao tem permissao para realizar esta operacao.`
      });
    }
    if (IsNotAdmin && isNotOwner) {
      return res.status(403).json({
        error: `O flashcard nao pertence ao utilizador.`
      });
    } else {
      const response = await deleteService(flashcardId);
      return res.status(200).json({message:'Flashcard apagado com sucesso.',response});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    });
  }
};


//* Services

/**
 * Inserts multiple flashcards into the database.
 *
 * @async
 * @function createManyService
 * @param {Array<Object>} flashcard_data - An array of flashcard objects to be inserted, each containing properties like question, answer, subject, and userId.
 *
 * @returns {Promise<Array<Object>>} - Returns a promise that resolves to an array of the newly created flashcard objects.
 */
async function createManyService(flashcard_data) {
  return await Flashcard.insertMany(flashcard_data);
}

/**
 * Inserts a single flashcard into the database.
 *
 * @async
 * @function createService
 * @param {Object} flashcard_data - A flashcard object to be inserted, containing properties like question, answer, subject, and userId.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the newly created flashcard object.
 */
async function createService(flashcard_data) {
  return await Flashcard.create(flashcard_data);
}

/**
 * Finds all flashcards in the database.
 *
 * @async
 * @function findAllService
 *
 * @returns {Promise<Array<Object>>} - Returns a promise that resolves to an array of all flashcard objects in the database.
 */
async function findAllService() {
  return Flashcard.find();
}

/**
 * Finds a flashcard by its ID.
 *
 * @async
 * @function findByIdService
 * @param {string} flashcard_id - The ID of the flashcard.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the flashcard object if found, or null if not found.
 */
async function findByIdService(flashcard_id) {
  return Flashcard.findOne({ _id: flashcard_id });
}

/**
 * Finds a flashcard by its ID and verifies if it belongs to the authenticated user.
 *
 * @async
 * @function findByIdAndUserIdService
 * @param {string} flashcard_id - The ID of the flashcard.
 * @param {string} user_id - The ID of the user.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to an array containing the flashcard object if found, or an empty array if not found.
 */
async function findByIdAndUserIdService(flashcard_id, user_id) {
  return Flashcard.findOne({ _id: flashcard_id, userId: user_id });
}

/**
 * Updates a flashcard document in the database, replacing all fields with the provided data.
 *
 * @async
 * @function totalUpdateService
 * @param {string} flashcard_id - The ID of the flashcard to be updated.
 * @param {Object} flashcard_data - An object containing the fields to update with their new values.
 *
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the updated flashcard object if found, or null if not found.
 */

async function totalUpdateService(flashcard_id, user_id, flashcard_data) {
  return Flashcard.findOneAndUpdate(
    { _id: flashcard_id, userId: user_id },
    flashcard_data,
    {
      new: true
    }
  );
}

/**
 * Updates specific fields of a flashcard document in the database.
 *
 * @async
 * @function specificUpdateService
 * @param {string} flashcard_id - The ID of the flashcard to be updated.
 * @param {Object} flashcard_data - An object containing the fields to update with their new values.
 *
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the updated flashcard object if found, or null if not found.
 */


async function specificUpdateService(flashcard_id, user_id, flashcard_data) {
  return Flashcard.findOneAndUpdate(
    { _id: flashcard_id, userId: user_id },

    { $set: flashcard_data },
    {
      new: true
    }
  );

}

async function deleteService(flashcard_id) {
  return await Flashcard.findByIdAndDelete(flashcard_id);
}

module.exports = {
  createOneOrManyController,
  findAllController,
  findByIdController,
  putController,
  patchController,
  deleteController

};
