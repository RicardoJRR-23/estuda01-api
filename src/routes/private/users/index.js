const express = require('express');
const router = express.Router();

const Controller = require('../../../controllers/UserController');

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
router.get('/:userId', Controller.getUser);


module.exports = router;