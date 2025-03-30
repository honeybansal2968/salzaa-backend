const express = require("express");
const router = express.Router();
const userController = require('../Controller/userController')

/**
 * @swagger
 * /api/user/authToken:
 *   get:
 *     summary: Get an authentication token
 *     tags:
 *       - User
 *     description: This API endpoint authenticates a user using their username and password and returns an access token.
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: johndoe
 *         description: The username of the user
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         example: securepassword123
 *         description: The password of the user
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsIn..."
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.get('/authToken', userController.getAuthToken);

/**
 * @swagger
 * /api/user/createUser:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     description: This API endpoint creates a new user with a username and password. The password is securely hashed before storing in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65a9b2f4cde7f4b5d6e4a3c1"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/createUser', userController.createUser);

module.exports = router;
