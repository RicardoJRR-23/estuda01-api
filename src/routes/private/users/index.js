const express = require('express');
const router = express.Router();

const update_schema = require('./update_schema');
const update_password_schema = require('./update_password_schema');
const Controller = require('../../../controllers/UserController');
const ValidateUserIdMiddleware = require('../../../middlewares/ValidateUserIdMiddleware');
const validateSchemaMiddleware = require('../../../middlewares/ValidateSchemaMiddleware');

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Retrieve user information
 *     description: >
 *       Fetches information about the authenticated user. The `userId` parameter 
 *       can either be "me" (to fetch information for the currently authenticated user) 
 *       or the user's specific ID. If the `userId` is invalid or does not match the 
 *       authenticated user, a 403 Forbidden response is returned.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the user to retrieve. Use "me" to fetch the authenticated user's 
 *           information or provide the specific user ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the authenticated user.
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *                 role:
 *                   type: string
 *                   description: The role assigned to the user.
 *       403:
 *         description: Unauthorized access to user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: >
 *                     The ID provided is either invalid or does not match the 
 *                     authenticated user.
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Generic error message for unexpected issues.
 */
router.get('/:userId',
  ValidateUserIdMiddleware,
  Controller.getUser
);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Updates the user email and name
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the user to retrieve. Use "me" to fetch the authenticated user's 
 *           information or provide the specific user ID.
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
 *             required:
 *               - name
 *               - email 
 *     responses:
 *       204:
 *         description: User information updated successfuly.
 *       400:
 *         description: Payload validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo 'name' está em falta."
 *       403:
 *         description: Unauthorized access to to update user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: >
 *                     The ID provided is either invalid or does not match the 
 *                     authenticated user.
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Generic error message for unexpected issues.
 */
router.put('/:userId',
  ValidateUserIdMiddleware,
  validateSchemaMiddleware(update_schema),
  Controller.updateUser
);


/**
 * @swagger
 * /users/{userId}/password:
 *   put:
 *     summary: Updates the user password
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           The ID of the user to retrieve. Use "me" to fetch the authenticated user's 
 *           information or provide the specific user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "senha1234"
 *               password:
 *                 type: string
 *                 min: 6
 *                 example: "@newPassword123"
 *             required:
 *               - currentPassword
 *               - password 
 *     responses:
 *       204:
 *         description: User password updated successfuly.
 *       400:
 *         description: Payload validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campo 'currentPassword' está em falta."
 *       403:
 *         description: Unauthorized access to update user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: >
 *                     The ID provided is either invalid or does not match the 
 *                     authenticated user.
 *       500:
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Generic error message for unexpected issues.
 */
router.put('/:userId/password',
  ValidateUserIdMiddleware,
  validateSchemaMiddleware(update_password_schema),
  Controller.updateUserPassword
);

module.exports = router;