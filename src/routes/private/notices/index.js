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

/**
 * @swagger
 * /notices:
 *  get:
 *    summary: get a list of notices
 *    description: This endpoint returns a list of notices that belongs to the authenticated user.
 *    tags:
 *      - Notices
 *    responses:
 *      '200':
 *        description: Notices successfuly returned
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    example: "6769973ec32d498d4402e3b0"
 *                  title:
 *                    type: string
 *                    example: "New Notice"
 *                  description:
 *                    type: string
 *                    example: "Details about the new notice."
 *                  datePublished:
 *                    type: string
 *                    example: "2024-12-01T00:00:00.000+00:00"
 *                  link:
 *                    type: string
 *                    example: "https://example.com/notice"
 *                  userId:
 *                    type: string
 *                    example: "6769973ec32d498d4402e3b0"
 *                  createdAt:
 *                    type: string
 *                    example: "2024-12-23T23:31:00.437+00:00"
 *                  updatedAt:
 *                    type: string
 *                    example: "2024-12-23T23:31:00.437+00:00"
 *      '500':
 *        description: Unexpected error occur.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 */
router.get('/', Controller.fetchNotices);

/**
 * @swagger
 * /notices/{noticeId}:
 *  get:
 *    summary: get a notice by its id
 *    description: This endpoint returns a notice that matches an id and does belong to the authenticated user.
 *    tags:
 *      - Notices
 *    parameters:
 *      - in: path
 *        name: noticeId
 *        required: true
 *        schema:
 *          type: string
 *        description: >
 *          The ID of notice that the user wants to fetch
 *    responses:
 *      '200':
 *        description: Notice successfuly fetched
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  example: "6769973ec32d498d4402e3b0"
 *                title:
 *                  type: string
 *                  example: "New Notice"
 *                description:
 *                  type: string
 *                  example: "Details about the new notice."
 *                datePublished:
 *                  type: string
 *                  example: "2024-12-01T00:00:00.000+00:00"
 *                link:
 *                  type: string
 *                  example: "https://example.com/notice"
 *                userId:
 *                  type: string
 *                  example: "6769973ec32d498d4402e3b0"
 *                createdAt:
 *                  type: string
 *                  example: "2024-12-23T23:31:00.437+00:00"
 *                updatedAt:
 *                  type: string
 *                  example: "2024-12-23T23:31:00.437+00:00"
 *      '404':
 *        description: Couldn't find the respective notice
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Edital não encontrado."
 *      '500':
 *        description: Unexpected error occur.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 *
 */
router.get('/:noticeId', Controller.fetchNotice);

module.exports = router;