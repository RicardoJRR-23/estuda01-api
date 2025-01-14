const express = require('express');
const router = express.Router();

const {
  createOneOrManyController,
  findAllController,
  findByIdController
} = require('../../../controllers/FlashcardController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const flashcard_post_many_schema = require('./flashcard_post_many_schema');

/**
 * @swagger
 * /flashcard/:
 *   post:
 *    tags:
 *      - Flashcard
 *    summary: Create one or many flashcards
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            oneOf:
 *              - type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - question
 *                    - answer
 *                  properties:
 *                    question:
 *                      type: string
 *                      example: "Is this real life?"
 *                    subject:
 *                      type: string
 *                      example: "Philosophy"
 *                    answer:
 *                      type: string
 *                      example: "Yes, it is."
 *                example:
 *                  [
 *                    {
 *                      "question": "Is this real life?",
 *                      "answer": "Yes, it is.",
 *                      "subject": "Philosophy"
 *                    },
 *                    {
 *                      "question": "1+1=2?",
 *                      "answer": "Yes, it is.",
 *                      "subject": "Math"
 *                    }
 *                  ]
 *              - type: object
 *                required:
 *                  - question
 *                  - answer
 *                properties:
 *                  question:
 *                    type: string
 *                    example: "Is this real life?"
 *                  subject:
 *                    type: string
 *                    example: "Philosophy"
 *                  answer:
 *                    type: string
 *                    example: "Yes, it is."
 *                example:
 *                  {
 *                    "question": "Is this real life?",
 *                    "answer": "Yes, it is.",
 *                    "subject": "Philosophy"
 *                  }
 *    responses:
 *      201:
 *        description: Flashcards successfuly created
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  question:
 *                    type: string
 *                  answer:
 *                    type: string
 *                  subject:
 *                    type: string
 *                  userId:
 *                    type: string
 *                  createdAt:
 *                    type: string
 *                  updatedAt:
 *                    type: string
 *      400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Bad request
 *                  example:
 *                    'O campo "answer" deve ser do tipo String.'
 *      401:
 *        description: Unauthorized access to user information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Unauthorized access to user information
 *                  example:
 *                    'Token inválido.'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Internal server error message
 *                  example:
 *                    'Ocorreu um erro inesperado. Tente novamente mais tarde.'
 */

router.post(
  '/',
  ValidateSchemaMiddleware(flashcard_post_many_schema),
  createOneOrManyController
);

/**
 * @swagger
 * /flashcard/:
 *   get:
 *    tags:
 *      - Flashcard
 *    summary: Get all flashcards
 *    responses:
 *      200:
 *        description: All flashcards
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  question:
 *                    type: string
 *                  answer:
 *                    type: string
 *                  subject:
 *                    type: string
 *                  userId:
 *                    type: string
 *                  createdAt:
 *                    type: string
 *                  updatedAt:
 *                    type: string
 *      401:
 *        description: Unauthorized access to user information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Unauthorized access to user information
 *                  example:
 *                    'Token não foi enviado.'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Internal server error message
 *                  example:
 *                    'Ocorreu um erro inesperado. Tente novamente mais tarde.'
 */

router.get('/', findAllController);

/** @swagger
 * /flashcard/{flashcardId}:
 *   get:
 *    tags:
 *      - Flashcard
 *    summary: Get flashcard by ID
 *    parameters:
 *      - name: flashcardId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Flashcard by ID
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                question:
 *                  type: string
 *                answer:
 *                  type: string
 *                subject:
 *                  type: string
 *                userId:
 *                  type: string
 *                createdAt:
 *                  type: string
 *                updatedAt:
 *                  type: string
 *      401:
 *        description: Unauthorized access to user information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Unauthorized access to user information
 *                  example:
 *                    'Token não foi enviado.'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Internal server error message
 *                  example:
 *                    'Ocorreu um erro inesperado. Tente novamente mais tarde.'
 */

router.get('/:flashcardId', findByIdController);



module.exports = router;
