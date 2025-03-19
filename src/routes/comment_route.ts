import express from "express";
const router = express.Router();
import commentController from "../controllers/comment_controller";
import { authMiddleware } from "../middleware/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
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
 *         content:
 *           type: string
 *           description: The content of the comment
 *         owner:
 *           type: string
 *           description: The user ID of the comment owner
 *         postId:
 *           type: string
 *           description: The post ID to which the comment belongs
 *       example:
 *         content: "This is a comment"
 *         owner: "60d0fe4f5311236168a109ca"
 *         postId: "65ff8729c3a123456789abcd"
 */

// Create a new comment (requires authentication)
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
 *     description: Retrieve all comments from the database
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 */
router.get("/", commentController.getAll.bind(commentController)); // Get all comments

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a comment using its unique ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to retrieve
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", commentController.getById.bind(commentController)); // Get a comment by ID

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Modify an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the comment
 *     responses:
 *       200:
 *         description: The comment was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized - User does not have permission
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  commentController.update.bind(commentController)
); // Update a comment

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a comment using its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: The comment was deleted successfully
 *       401:
 *         description: Unauthorized - User does not have permission
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authMiddleware,
  commentController.delete.bind(commentController)
); // Delete a comment

export default router;
