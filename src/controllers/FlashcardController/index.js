const { Flashcard } = require('../../models');

/**
 * This function creates a flashcard
 *
 * @param {Object} req - The Express request object, containing the user's data in `req.body`.
 * @param {Object} res - The Express response object, used to send the response.
 *
 *
 * @returns response.status(code).json(body)
 * code: 201
 * body: {
 * flashcard: flashcard <Flashcard>
 * }
 *
 * code: 500
 * body: {
 *  error: "Erro ao criar cronograma. Erro interno do servidor"
 * }
 *
 */

const createController = async (req, res) => {
  try {
    const flashcard_data = req.body;

    const flashcard = await createService(flashcard_data);

    return res.status(201).json({ flashcard: flashcard });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

module.exports = { createController };

// Services

async function createService(flashcard_data) {
  return await Flashcard.create(flashcard_data);
}

//TODO Implement the other services for future controllers to make
/*
async function FindByIdService(flashcard_id) {
  return Flashcard.findById(flashcard_id);
}

async function FindAllService() {
  return Flashcard.find();
}

async function FindByUserIdService(user_id) {
  return Flashcard.find({ userId: user_id });
}

async function UpdateService(flashcard_id, flashcard_data) {
  return Flashcard.findByIdAndUpdate(flashcard_id, flashcard_data, {
    new: true
  });
}

async function DeleteService(flashcard_id) {
  return Flashcard.findByIdAndDelete(flashcard_id);
}
*/
