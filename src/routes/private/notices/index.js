const express = require('express');
const router = express.Router();

const create_schema = require('./create_schema');
const put_schema = require('./put_schema');
const patch_schema = require('./patch_schema');
const Controller = require('../../../controllers/NoticeController');
const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const IsAdminMiddleware = require('../../../middlewares/IsAdminMiddleware');

/**
 * @swagger
 * /notices:
 *  get:
 *    summary: get a list of notices
 *    description: This endpoint returns a list of notices.
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
 *    description: This endpoint returns a notice that matches the provided id.
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

// The routes bellow only should be accessed by an admin user
router.use(IsAdminMiddleware);

/**
 * @swagger
 * /notices:
 *   post:
 *     summary: Create a new notice
 *     description: This endpoint can be only accessed by admins and it allows them to create a new notice with the provided details. It validates the request payload according to the defined schema.
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
 *                 _id:
 *                   type: string
 *                   description: The id of the created notice instance
 *                 title:
 *                   type: string
 *                   description: The title of the notice.
 *                 description:
 *                   type: string
 *                   description: A description of the notice.
 *                 datePublished:
 *                   type: string
 *                   format: date-time
 *                   description: The publication date of the notice in ISO 8601 format (optional).
 *                 link:
 *                    type: string
 *                    format: uri
 *                    description: A valid link to the notice.
 *                 createdAt:
 *                    type: string
 *                    format: date-time
 *                    description: The date and time on which this notice instance was created
 *                 updatedAt:
 *                    type: string
 *                    format: date-time
 *                    description: The date and time on which this notice instance was created
 *               example:
 *                 _id: '6769973ec32d498d4402e3b0'
 *                 title: 'New Notice'
 *                 description: 'Details about the New notice.'
 *                 datePublished: '2024-12-01'
 *                 link: 'https://example.com/notice'
 *                 createdAt: '2024-12-23T23:31:00.437+00:00'
 *                 updatedAt: '2024-12-23T23:31:00.437+00:00'
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
 * /notices/{noticeId}:
 *   put:
 *     summary: Update an instance of a notice
 *     description: This endpoint can be only accessed by admins and it allows them to update the entire payload of a notice instance with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of notice that the user wants to update
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
 *               - datePublished
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
 *               title: "updated Notice"
 *               description: "Details about the updated notice."
 *               datePublished: "2024-12-01"
 *               link: "https://example.com/notice"
 *     responses:
 *       '204':
 *         description: Notice successfuly updated 
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
 *       '404':
 *         description: Couldn't find the respective notice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Edital não encontrado."
 */
router.put('/:noticeId',
  ValidateSchemaMiddleware(put_schema),
  Controller.updateNotice
);

/**
 * @swagger
 * /notices/{noticeId}:
 *   patch:
 *     summary: Patch an instance of a notice
 *     description: This endpoint can be only accessed by admins and it allows them to update partially the payload of a notice instance with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of notice that the user wants to patch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               title: "Patched Notice"
 *               description: "Details about the patched notice."
 *     responses:
 *       '204':
 *         description: Notice successfuly patched
 *       '400':
 *         description: Validation error due to invalid payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Pelo menos um dos campos "title", "description", "datePublished" or "link" tem de ser providenciado.'
 *       '404':
 *         description: Couldn't find the respective notice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Edital não encontrado."
 */
router.patch('/:noticeId',
  ValidateSchemaMiddleware(patch_schema),
  Controller.patchNotice
);

/**
 * @swagger
 * /notices/{noticeId}:
 *   delete:
 *     summary: Delete an instance of a notice
 *     description: This endpoint can be only accessed by admins and it allows them to delete a created instance of a notice. It validates if the provided id matches an existing one on the database else it returns 404
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the notice that the user wants to delete
 *     responses:
 *       '204':
 *         description: Notice successfuly deleted
 *       '404':
 *         description: Couldn't find the respective notice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Edital não encontrado."
 * 
 */
router.delete('/:noticeId', Controller.deleteNotice);

module.exports = router;