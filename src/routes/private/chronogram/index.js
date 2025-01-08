const express = require('express');
const router = express.Router();
const {
  createController,
  findByUserIdController,
  findByIdController,
  putController,
  patchController,
  deleteController
} = require('../../../controllers/ChronogramController');

const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');
const chronogram_post_schema = require('./chronogram_post_schema');

const chronogram_put_schema = require('./chronogram_put_schema');
const chronogram_patch_schema = require('./chronogram_patch_schema');


/**
 * @swagger
 * /chronogram/:
 *   post:
 *     summary: Create a new chronogram
 *     tags:
 *       - Chronogram
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
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
 *             example:
 *               title: "Novo Cronograma"
 *               description: "Detalhes do cronograma"
 *               startDate: "2024-01-01"
 *               endDate: "2024-01-31"
 *               tasks: [
 *                  {
 *                    name: "Task 1",
 *                    completed: "false"
 *                  },
 *                  {
 *                    name: "Task 2",
 *                    completed: "true"
 *                  }
 *               ]
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
 *
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
 *                         description: The title of the chronogram
 *                       description:
 *                         type: string
 *                         description: The description of the chronogram
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         description: The start date of the chronogram
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         description: The end date of the chronogram
 *                       tasks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the task
 *                             completed:
 *                               type: boolean
 *                               description: Whether the task is completed or not
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
 *     parameters:
 *       - in: path
 *         name: chronogramId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the chronogram. It is possible to get all the chronograms of a user by using the endpoint `/chronogram/`.
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

/**
 *
 * @swagger
 * /chronogram/{chronogramId}:
 *   put:
 *     summary: Updates a whole chronogram by its id
 *     description: >
 *         Update a chronogram by using its `chronogramId` as identifier of
 *         the chronogram created, if the user is authenticated.
 *         The empty fields or missing fields, that are not required on create, will be emptied or completed with null.
 *     tags: [Chronogram]
 *     parameters:
 *       - in: path
 *         name: chronogramId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the chronogram. It is possible to get all the chronograms of a user by using the endpoint `/chronogram/`.
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
 *                 example:
 *                   'Cronograma de exemplo'
 *               description:
 *                 type: string
 *                 description: The description of the chronogram
 *                 example:
 *                   'Descrição do cronograma de exemplo'
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example:
 *                   '1999-12-01T23:59:59.999Z'
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example:
 *                   '1999-12-31T23:59:59.999Z'
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 'Tarefa 1'
 *                     completed:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       200:
 *         description: Chronogram updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The title of the chronogram
 *                   example:
 *                     'Cronograma de exemplo'
 *                 description:
 *                   type: string
 *                   description: The description of the chronogram
 *                   example:
 *                     'Descrição do cronograma de exemplo'
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example:
 *                     '1999-12-01T23:59:59.999Z'
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example:
 *                     '1999-12-31T23:59:59.999Z'
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: 'Tarefa 1'
 *                       completed:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Bad request
 *                   example:
 *                    'Campo \"title\" está em falta.'
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
 */
router.put(
  '/:chronogram_id',
  ValidateSchemaMiddleware(chronogram_put_schema),
  putController
);

/**
 *
 * @swagger
 * /chronogram/{chronogramId}:
 *   patch:
 *     summary: Update specific fields of a chronogram by id
 *     description: >
 *         Update a chronogram by using its `chronogramId` as identifier of
 *         the chronogram created, if the user is authenticated.
 *         The missing fields, that are not required on create, will not be updated.
 *     tags: [Chronogram]
 *     parameters:
 *       - in: path
 *         name: chronogramId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the chronogram. It is possible to get all the chronograms of a user by using the endpoint `/chronogram/`.
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
 *                 example:
 *                   'Cronograma de exemplo'
 *               description:
 *                 type: string
 *                 description: The description of the chronogram
 *                 example:
 *                   'Descrição do cronograma de exemplo'
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example:
 *                   '1999-12-01T23:59:59.999Z'
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example:
 *                   '1999-12-31T23:59:59.999Z'
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 'Tarefa 1'
 *                     completed:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       200:
 *         description: Chronogram updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The title of the chronogram
 *                   example:
 *                     'Cronograma de exemplo'
 *                 description:
 *                   type: string
 *                   description: The description of the chronogram
 *                   example:
 *                     'Descrição do cronograma de exemplo'
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example:
 *                     '1999-12-01T23:59:59.999Z'
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example:
 *                     '1999-12-31T23:59:59.999Z'
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: 'Tarefa 1'
 *                       completed:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Bad request
 *                   example:
 *                    'Requisição inválida.'
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
 */
router.patch(
  '/:chronogram_id',
  ValidateSchemaMiddleware(chronogram_patch_schema),
  patchController
);

/**
 * @swagger
 * /chronogram/{chronogramId}:
 *   delete:
 *     summary: Delete a chronogram by id if owned by user
 *     description: >
 *         Deletes a chronogram by using its `chronogramId` as identifier, if the user is authenticated.
 *     tags: [Chronogram]
 *     parameters:
 *       - in: path
 *         name: chronogramId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the chronogram. It is possible to get all the chronograms of a user by using the endpoint `/chronogram/`.
 *     responses:
 *       '200':
 *         description: Chronogram successfuly deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cronograma apagado com sucesso."
 *       '404':
 *         description: Couldn't find the specific chronogram
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cronograma não encontrado."
 *
 */
router.delete('/:chronogram_id', deleteController);


module.exports = router;
