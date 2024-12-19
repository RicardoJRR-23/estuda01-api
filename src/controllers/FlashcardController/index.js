const Flashcard = require("../../models/Flashcard")

const createController = async (flashcardData) => {
  try {
    const { title, startDate, endDate, userId } = flashcardData // Disstructure the values of 'flashcardData'
    const requiredFields = {
      title,
      startDate,
      endDate,
      userId,
    } //Makes an object with the required fields

    const missingFields = Object.entries(requiredFields) //Converts the 'requiredFields' into a list of pairs [key, value]
      .filter(([key, value]) => value === null || value === undefined || "") //Filters the null, undefined or empty string
      .map(([key]) => key) // and make a map with them
    if (missingFields.length > 0) {
      //Verify if exists nonvalid fields
      throw {
        // sends an exception containing an error message
        message: `Os seguintes campos estão ausentes ou inválidos: ${missingFields.join(
          ", "
        )}`,
      }
    }

    const flashcard = await createService(flashcardData)
    return flashcard
  } catch (error) {
    throw { message: error.message }
  }
}

module.exports = { createController }

// Services

async function createService(flashcardData) {
  return Flashcard.create(flashcardData)
}
async function FindByIdService(flashcardId) {
  return Flashcard.findById(flashcardId)
}

async function FindAllService() {
  return Flashcard.find()
}

async function FindByUserIdService(userId) {
  return Flashcard.find({ userId })
}

async function UpdateService(flashcardId, flashcardData) {
  return Flashcard.findByIdAndUpdate(flashcardId, flashcardData, {
    new: true,
  })
}

async function DeleteService(flashcardId) {
  return Flashcard.findByIdAndDelete(flashcardId)
}
