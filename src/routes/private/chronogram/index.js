const express = require('express');
const router = express.Router();
const {
  createController,
  findByUserIdController,
  findByIdController
} = require('../../../controllers/ChronogramController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const chronogram_post_schema = require('./chronogram_post_schema');
/**
 * @swagger
 * /chronogram/:
 *   post:
 *     summary: Create a new chronogram
 *     tags: [Chronogram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the chronogram
 *               description:
 *                 type: string
 *                 description: The description of the chronogram
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date of the chronogram
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date of the chronogram
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the task
 *                     completed:
 *                       type: boolean
 *                       description: Whether the task is completed or not
 *               userId:
 *                 type: string
 *                 description: The id of the user
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *               - userId
 *     responses:
 *       201:
 *         description: Chronogram created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chronogram:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           completed:
 *                             type: boolean
 *                     userId:
 *                       type: string
 *       400:
 *         description: Bad request. Missing or wrongly filled required fields or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo \"title\" deve ser do tipo String."
 *
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

router.post(
  '/',
  ValidateSchemaMiddleware(chronogram_post_schema),
  createController
);

/**
 *
 * @swagger
 * /chronogram/:
 *   get:
 *     summary: Get all chronograms of a user
 *     description: >
 *         Get all chronograms of a user by using its `userId` as identifier of
 *         the chronograms created, if the user is authenticated.
 *     tags: [Chronogram]
 *     responses:
 *       200:
 *         description: Chronograms found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chronograms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       tasks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             completed:
 *                               type: boolean
 *                       userId:
 *                         type: string
 *       401:
 *         description: Unauthorized access to user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Unauthorized access to user information
 *                   example:
 *                    'Token não foi enviado.'
 *
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
 *                   example:
 *                    'Ocorreu um erro inesperado. Tente novamente mais tarde.'
 *
 */

router.get('/', findByUserIdController);

/**
 *
 * @swagger
 * /chronogram/{chronogramId}:
 *   get:
 *     summary: Get a chronogram by id
 *     description: >
 *         Get a chronogram by using its `chronogramId` as identifier of
 *         the chronogram created, if the user is authenticated.
 *     tags: [Chronogram]
 *     responses:
 *       200:
 *         description: Chronogram found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                     _id:
 *                       type: string
 *                       example: '432109876543210987654321'
 *                     title:
 *                       type: string
 *                       description: The title of the chronogram
 *                       example:
 *                         'Cronograma de exemplo'
 *                     description:
 *                       type: string
 *                       description: The description of the chronogram
 *                       example:
 *                         'Descrição do cronograma de exemplo'
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example:
 *                         '1999-12-01T23:59:59.999Z'
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example:
 *                         '1999-12-31T23:59:59.999Z'
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: 'Tarefa 1'
 *                           completed:
 *                             type: boolean
 *                             example: false
 *                     userId:
 *                       type: string
 *                       example:
 *                         '123456789012345678901234'
 *
 *       401:
 *         description: Unauthorized access to user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Unauthorized access to user information
 *                   example:
 *                    'Token não foi enviado.'
 *
 *       404:
 *         description: Chronogram not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Chronogram not found
 *                   example:
 *                    'Cronograma não encontrado.'
 *
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
 *                   example:
 *                    'Ocorreu um erro inesperado. Tente novamente mais tarde.'
 *
 */

router.get('/:chronogram_id', findByIdController);

module.exports = router;
