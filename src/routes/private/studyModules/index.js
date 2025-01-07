const express = require('express');
const router = express.Router();

const create_schema = require('./create_schema');
const put_schema = require('./put_schema');
const patch_schema = require('./patch_schema');
const Controller = require('../../../controllers/StudyModuleController');
const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');

/**
 * @swagger
 * /notices:
 * /studyModules:
 *   post:
 *     summary: Create a new study module
 *     description: This endpoint creates a new nostudy module with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - studyModules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the study module.
 *               description:
 *                 type: string
 *                 description: A description of the study module.
 *               topics:
 *                 type: array
 *                 description: The list of topics covered in the study module
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the study module topic
 *                     content:
 *                       type: string
 *                       description: The content of the study module topic
 *             example:
 *               title: "Matemática"
 *               description: "Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências"
 *               topics: 
 *                 - name: 'Álgebra'
 *                   content: 'Polinômios, equações, inequações e funções'
 *                 - name: 'Geometria'
 *                   content: 'Ângulos, Perpendicularidade e paralelismo, funções trigonometricas de angulus suplementarios.'
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
 *                   description: The id of the created study module instance
 *                 title:
 *                   type: string
 *                   description: The title of the study module.
 *                 description:
 *                   type: string
 *                   description: A description of the study module.
 *                 topics:
 *                   type: array
 *                   description: The list of topics covered in the study module
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The id of the the topic item
 *                       name:
 *                         type: string
 *                         description: The name of the study module topic
 *                       content:
 *                         type: string
 *                         description: The content of the study module topic
 *                 userId:
 *                   type: string
 *                   description: The id of the user who is authenticated and created the study module
 *                 createdAt:
 *                   type: string
 *                   description: The time and date on which the study module was created
 *                 updatedAt:
 *                   type: string
 *                   description: The last time the study module was updated
 *               example:
 *                 _id: '6769973ec32d498d4402e3b0'
 *                 title: "Matemática"
 *                 description: "Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências"
 *                 topics: 
 *                   - _id: '8969973ec32d498d4402eb04'
 *                     name: 'Álgebra'
 *                     content: 'Polinômios, equações, inequações e funções'
 *                   - _id: '4569973ec32d498d4402eb64'
 *                     name: 'Geometria'
 *                     content: 'Ângulos, Perpendicularidade e paralelismo, funções trigonometricas de ângulos suplementários.'
 *                 userId: '7869973ec32d498d4402ec01'
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
 *                   example: "Campo \"title\" está em falta."
 */
router.post('/',
  ValidateSchemaMiddleware(create_schema),
  Controller.registerStudyModule
);

/**
 * @swagger
 * /studyModules:
 *   get:
 *     summary: get a list of study modules
 *     description: This endpoint returns a list of study modules that belongs to the authenticated user.
 *     tags:
 *       - studyModules
 *     responses:
 *       '200':
 *         description: study modules successfuly returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The id of the created study module instance
 *                     example: '6769973ec32d498d4402e3b0'
 *                   title:
 *                     type: string
 *                     description: The title of the study module.
 *                     example: "Matemática"
 *                   description:
 *                     type: string
 *                     description: A description of the study module.
 *                     example:  "Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências"
 *                   topics:
 *                     type: array
 *                     description: The list of topics covered in the study module
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                          type: string
 *                          description: The id of the the topic item
 *                          example: '8969973ec32d498d4402eb04'
 *                         name:
 *                           type: string
 *                           description: The name of the study module topic
 *                           example: 'Álgebra'
 *                         content:
 *                           type: string
 *                           description: The content of the study module topic
 *                           example: 'Polinômios, equações, inequações e funções'
 *                   userId:
 *                     type: string
 *                     description: The id of the user who is authenticated and created the study module
 *                     example: '7869973ec32d498d4402ec01'
 *                   createdAt:
 *                     type: string
 *                     description: The time and date on which the study module was created
 *                     example: '2024-12-23T23:31:00.437+00:00'
 *                   updatedAt:
 *                     type: string
 *                     description: The last time the study module was updated
 *                     example: '2024-12-23T23:31:00.437+00:00'
 *       '500':
 *         description: Unexpected error occur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 */
router.get('/', Controller.fetchStudyModules);

/**
 * @swagger
 * /studyModules/{studyModuleId}:
 *   get:
 *     summary: get an instance of a study module
 *     description: This endpoint returns an study module that belongs to the authenticated user.
 *     tags:
 *       - studyModules
 *     parameters:
 *       - in: path
 *         name: studyModuleId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the study module that the user wants to fetch
 *     responses:
 *       '200':
 *         description: study module successfuly returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The id of the created study module instance
 *                   example: '6769973ec32d498d4402e3b0'
 *                 title:
 *                   type: string
 *                   description: The title of the study module.
 *                   example: "Matemática"
 *                 description:
 *                   type: string
 *                   description: A description of the study module.
 *                   example:  "Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências"
 *                 topics:
 *                   type: array
 *                   description: The list of topics covered in the study module
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The id of the the topic item
 *                         example: '8969973ec32d498d4402eb04'
 *                       name:
 *                         type: string
 *                         description: The name of the study module topic
 *                         example: 'Álgebra'
 *                       content:
 *                         type: string
 *                         description: The content of the study module topic
 *                         example: 'Polinômios, equações, inequações e funções'
 *                 userId:
 *                   type: string
 *                   description: The id of the user who is authenticated and created the study module
 *                   example: '7869973ec32d498d4402ec01'
 *                 createdAt:
 *                   type: string
 *                   description: The time and date on which the study module was created
 *                   example: '2024-12-23T23:31:00.437+00:00'
 *                 updatedAt:
 *                   type: string
 *                   description: The last time the study module was updated
 *                   example: '2024-12-23T23:31:00.437+00:00'
 *       '404':
 *         description: Couldn't find the respective study module
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Módulo de Estudo não encontrado."
 *       '500':
 *         description: Unexpected error occur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 */
router.get('/:studyModuleId', Controller.fetchStudyModule);

/**
 * @swagger
 * /studyModules/{studyModuleId}:
 *   put:
 *     summary: Fully updates a study module
 *     description: This endpoint updates an instance of a study module with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - studyModules
 *     parameters:
 *       - in: path
 *         name: studyModuleId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the study module that the user wants to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - topics
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the study module.
 *               description:
 *                 type: string
 *                 description: A description of the study module.
 *               topics:
 *                 type: array
 *                 description: The list of topics covered in the study module
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the study module topic
 *                     content:
 *                       type: string
 *                       description: The content of the study module topic
 *             example:
 *               title: "Algoritmos e estrutura de dados"
 *               description: "Disciplina abordada em ciência de computação que ensina a teoria e a pratica de Algoritmos e estrutura de dados"
 *               topics: 
 *                 - name: 'Algoritmos'
 *                   content: 'Selection-Search, Binary-Search e Quicksort'
 *     responses:
 *       '204':
 *         description: Sudy module updated successfully.
 *       '404':
 *         description: Couldn't find the respective study module
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Módulo de Estudo não encontrado."
 *       '400':
 *         description: Validation error due to invalid payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo \"title\" está em falta."
 */
router.put('/:studyModuleId',
  ValidateSchemaMiddleware(put_schema),
  Controller.updateStudyModule
);

/**
 * @swagger
 * /studyModules/{studyModuleId}:
 *   patch:
 *     summary: Partially updates a study module
 *     description: This endpoint patches an instance of a study module with the provided details. It validates the request payload according to the defined schema.
 *     tags:
 *       - studyModules
 *     parameters:
 *       - in: path
 *         name: studyModuleId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the study module that the user wants to patch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the study module.
 *               description:
 *                 type: string
 *                 description: A description of the study module.
 *               topics:
 *                 type: array
 *                 description: The list of topics covered in the study module
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the study module topic
 *                     content:
 *                       type: string
 *                       description: The content of the study module topic
 *             example:
 *               description: "Ramo rigoroso do conhecimento"
 *     responses:
 *       '204':
 *         description: Sudy module patched successfully.
 *       '404':
 *         description: Couldn't find the respective study module
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Módulo de Estudo não encontrado."
 *       '400':
 *         description: Validation error due to invalid payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Pelo menos um dos campos "title", "description" ou "topics" deve ser providenciado.'
 */
router.patch('/:studyModuleId',
  ValidateSchemaMiddleware(patch_schema),
  Controller.patchStudyModule
);

module.exports = router;