const express = require('express');
const router = express.Router();

const {
  createController
} = require('../../../controllers/FlashcardController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const flashcard_form_schema = require('./flashcard_form_schema');

/**
 * @swagger
 * /flashcard:
 *   post:
 *     summary: Create a new flashcard
 *     tags: [Flashcard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question about the subject
 *               answer:
 *                 type: string
 *                 description: The answer of the question
 *               subject:
 *                 type: string
 *                 description: The subject of the flashcard
 *               userId:
 *                 type: string
 *                 description: The id of the user
 *             required:
 *               - question
 *               - answer
 *               - userId
 *     responses:
 *       201:
 *         description: Flashcard created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcard:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: The question about the subject
 *                     answer:
 *                       type: string
 *                       description: The answer of the question
 *                     subject:
 *                       type: string
 *                       description: The subject of the flashcard
 *                     userId:
 *                       type: string
 *                       description: The id of the user
 *       400:
 *         description: Bad request. Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   description: Array of validation errors
 *                   example: ["Question is required", "Answer is required"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Internal server error message
 */

router.post('/', ValidateSchemaMiddleware(flashcard_form_schema),createController);

module.exports = router;
