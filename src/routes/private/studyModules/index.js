const express = require('express');
const router = express.Router();

const create_schema = require('./create_schema');
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

module.exports = router;