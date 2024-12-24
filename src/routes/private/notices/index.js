const express = require('express');
const router = express.Router();

const create_schema = require('./create_schema');
const Controller = require('../../../controllers/NoticeController');
const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');

/**
 * @swagger
 * /notices:
 *   post:
 *     summary: Create a new notice
 *     description: This endpoint creates a new notice with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - Notices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - link
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the notice.
 *               description:
 *                 type: string
 *                 description: A description of the notice.
 *               datePublished:
 *                 type: string
 *                 format: date-time
 *                 description: The publication date of the notice in ISO 8601 format (optional).
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: A valid link to the notice.
 *             example:
 *               title: "New Notice"
 *               description: "Details about the new notice."
 *               datePublished: "2024-12-01"
 *               link: "https://example.com/notice"
 *     responses:
 *       '201':
 *         description: Notice created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  id:
 *                    type: integer
 *                    example: 6769973ec32d498d4402e3b0
 *       '400':
 *         description: Validation error due to invalid payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo \"title\" está em falta.; Campo \"link\" deve ser um link válido."
 */
router.post('/',
  ValidateSchemaMiddleware(create_schema),
  Controller.registerNotice
);

module.exports = router;