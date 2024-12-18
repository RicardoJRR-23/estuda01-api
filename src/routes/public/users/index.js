const express = require('express');
const router = express.Router();

const middleware = require('../../../middlewares/UserValidationMiddleware');
const controller = require('../../../controllers/UserController');

/**
 * @swagger
 * /users:
 *   post:
 *     summary: User creation
 *     description: Endpoint responsible to create a user on the system.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "senha1234"
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *                 example: "student"
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: User created with success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "João Silva"
 *                 email:
 *                   type: string
 *                   example: "joao.silva@email.com"
 *                 role:
 *                   type: string
 *                   example: "student"
 *       "400":
 *         description: Payload validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo 'name' incorreto."
 *       "409":
 *         description: Conflict - duplicated email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Este email já foi usado."
 *       "500":
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocorreu um erro inesperado. Tente novamente mais tarde."
 */
router.post('/',
  middleware,
  controller.registerUser
);

module.exports = router;