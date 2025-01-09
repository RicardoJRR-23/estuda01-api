const { Flashcard } = require('../../models');

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

// Services

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

module.exports = { createOneOrManyController };
