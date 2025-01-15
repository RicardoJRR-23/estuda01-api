const mongoose = require('mongoose');

/**
 * @example:
 *    question: Is this real life?
 *    answer: Yes, it is.
 *    subject: English
 *    userId: 6762d8434bdca716d901ee84
 */

const FlashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    subject: {
      type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Flashcard', FlashcardSchema);
