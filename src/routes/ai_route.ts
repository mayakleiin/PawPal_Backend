import express from "express";
import aiController from "../controllers/ai_controller";
import { authMiddleware } from "../middleware/auth_middleware";
import rateLimit from "express-rate-limit";

const router = express.Router();

/**
 * Rate limiter - Limit to 5 AI requests per minute per IP
 */
const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many AI requests, please try again later." },
});

/**
 * @swagger
 * tags:
 *   - name: AI
 *     description: API for AI-generated responses using Gemini
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AIRequest:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         question:
 *           type: string
 *       example:
 *         question: "How can I train my dog?"
 *     AIResponse:
 *       type: object
 *       properties:
 *         answer:
 *           type: string
 *       example:
 *         answer: "To train your dog effectively, use positive reinforcement, be consistent, and keep training sessions short."
 *     AIErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *       example:
 *         error: "Failed to fetch AI response"
 */

/**
 * @swagger
 * /ai:
 *   post:
 *     summary: Get AI-generated response
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIRequest'
 *     responses:
 *       200:
 *         description: Successfully generated an AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Invalid request (missing question or irrelevant)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIErrorResponse'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIErrorResponse'
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/",
  authMiddleware,
  aiRateLimiter,
  aiController.askAI.bind(aiController)
);

export default router;
