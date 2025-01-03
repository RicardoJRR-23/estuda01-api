const express = require('express');
const router = express.Router();
const {
  createController
} = require('../../../controllers/ChronogramController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const chronogram_post_schema = require('./chronogram_post_schema');
/**
 * @swagger
 * /chronogram:
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

router.post('/', ValidateSchemaMiddleware(chronogram_post_schema), createController);

module.exports = router;
