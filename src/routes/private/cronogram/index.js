const express = require('express');
const router = express.Router();
const {
  createController
} = require('../../../controllers/CronogramController');

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
 *                 message:
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
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Bad request. Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Os seguintes campos estão ausentes ou inválidos
 *       422:
 *         description: Invalid UserId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: O UserId é inválido
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao criar cronograma. Erro interno do servidor
 */

router.post('/', createController);

module.exports = router;
