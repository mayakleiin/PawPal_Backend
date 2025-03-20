import express from "express";
import { postsController } from "../controllers/post_controller";
import basePostsController from "../controllers/post_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts and likes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         image:
 *           type: string
 *         owner:
 *           type: string
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreatePostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         image:
 *           type: string
 *     UpdatePostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         image:
 *           type: string
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/", postsController.getAll.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get("/:id", basePostsController.getById.bind(basePostsController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  basePostsController.create.bind(basePostsController)
);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.put(
  "/:id",
  authMiddleware,
  basePostsController.update.bind(basePostsController)
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete(
  "/:id",
  authMiddleware,
  basePostsController.delete.bind(basePostsController)
);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked
 *       400:
 *         description: Already liked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post(
  "/:id/like",
  authMiddleware,
  postsController.likePost.bind(postsController)
);

/**
 * @swagger
 * /posts/{id}/like:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked
 *       400:
 *         description: Post not liked yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete(
  "/:id/like",
  authMiddleware,
  postsController.unlikePost.bind(postsController)
);

export default router;
