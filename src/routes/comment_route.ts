import express from "express";
const router = express.Router();
import commentController from "../controllers/comment_controller";
import { authMiddleware } from "../middleware/auth_middleware";

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API for managing comments
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - owner
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         owner:
 *           type: string
 *           description: The user ID of the comment owner
 *         postId:
 *           type: string
 *           description: The post ID to which the comment belongs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the comment was created
 *       example:
 *         _id: "65ff8729c3a123456789abcd"
 *         content: "This is a comment"
 *         owner: "60d0fe4f5311236168a109ca"
 *         postId: "65ff8729c3a123456789abce"
 *         createdAt: "2025-03-19T12:34:56Z"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  commentController.create.bind(commentController)
);

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Successfully fetched all comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", commentController.getAll.bind(commentController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get("/:id", commentController.getById.bind(commentController));

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put(
  "/:id",
  authMiddleware,
  commentController.update.bind(commentController)
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete(
  "/:id",
  authMiddleware,
  commentController.delete.bind(commentController)
);

export default router;
