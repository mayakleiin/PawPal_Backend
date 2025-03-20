import express from "express";
import userController from "../controllers/user_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API for managing users and their dogs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Dog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         birthYear:
 *           type: integer
 *         birthMonth:
 *           type: integer
 *         breed:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         dogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Dog'
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     AddDogRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         birthYear:
 *           type: integer
 *         birthMonth:
 *           type: integer
 *         breed:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", authMiddleware, userController.getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid User ID
 *       404:
 *         description: User not found
 */
router.get("/:userId", authMiddleware, userController.getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/:userId", authMiddleware, userController.updateUserDetails);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete("/:userId", authMiddleware, userController.deleteUser);

/**
 * @swagger
 * /users/{userId}/dogs:
 *   post:
 *     summary: Add a dog to user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDogRequest'
 *     responses:
 *       200:
 *         description: Dog added successfully
 *       404:
 *         description: User not found
 */
router.post("/:userId/dogs", authMiddleware, userController.addDog);

/**
 * @swagger
 * /users/{userId}/dogs/{dogId}:
 *   put:
 *     summary: Update a user's dog
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: dogId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDogRequest'
 *     responses:
 *       200:
 *         description: Dog updated successfully
 *       404:
 *         description: User or Dog not found
 */
router.put("/:userId/dogs/:dogId", authMiddleware, userController.updateDog);

/**
 * @swagger
 * /users/{userId}/dogs/{dogId}:
 *   delete:
 *     summary: Delete a user's dog
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: dogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dog deleted successfully
 *       404:
 *         description: User or Dog not found
 */
router.delete("/:userId/dogs/:dogId", authMiddleware, userController.deleteDog);

export default router;
