const express = require('express');
const router = express.Router();

const create_schema = require('./create_schema');
const Controller = require('../../../controllers/SessionController');
const ValidateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a user session
 *     description: Validates user credentials and generates an access token for authenticated sessions.
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *                 example: joao.silva@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 min: 6
 *                 description: The password of the user.
 *                 example: senha1234
 *     security: []
 *     responses:
 *       201:
 *         description: Successfully created session and returned access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The generated access token for the session.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the validation issue.
 *                   example: "O email providenciado não é valido"
 *       401:
 *         description: Unauthorized. Invalid credentials provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the issue.
 *                   example: "Credenciais inválidas."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for unexpected server issues.
 *                   example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 */
router.post('/',
  ValidateSchemaMiddleware(create_schema),
  Controller.createSession
)

module.exports = router;