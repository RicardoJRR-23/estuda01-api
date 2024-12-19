const mongoose = require('mongoose');

/**
 * @swagger
 * example:
 *      question: Is this a question?   
 *      answer: Yes, it is.
 *      subject: English
 *      userId: 6762d8434bdca716d901ee84
 */

const FlashcardSchema = new mongoose.Schema({
question: { type: String, required: true },
answer: { type: String, required: true },
subject: { type: String },
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });


FlashcardSchema.statics.createFlashcard = async function (flashcardData) {
    return this.create(flashcardData)
}

FlashcardSchema.statics.getFlashcardById = async function (flashcardId) {
    return this.findById(flashcardId)
}

FlashcardSchema.statics.getAllFlashcard = async function() {
    return this.find()
}


module.exports = mongoose.model('Flashcard', FlashcardSchema);