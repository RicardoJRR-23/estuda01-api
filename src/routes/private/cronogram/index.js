const express = require('express');
const router = express.Router();
const {
  createController
} = require('../../../controllers/CronogramController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const cronogram_form_schema = require('./cronogram_form_schema');
/**
 * @swagger
 * /cronogram:
 *   post:
 *     summary: Create a new cronograma
 *     tags: [Cronograma]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the cronograma
 *               description:
 *                 type: string
 *                 description: The description of the cronograma
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date of the cronograma
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date of the cronograma
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
 *         description: Cronograma created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cronograma:
 *                   type: object
 *                   properties:
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
 *       400:
 *         description: Bad request. Missing or wrongly filled required fields or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   example: [
 *                     "\"Título\" é um campo obrigatório",
 *                     "\"Data inicial\" deve estar no formato ISO 8601",
 *                     "\"Data final\" é um campo obrigatório"
 *                   ]
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

router.post('/', ValidateSchemaMiddleware(cronogram_form_schema), createController);

module.exports = router;
