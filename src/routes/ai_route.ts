import express from "express";
import aiController from "../controllers/ai_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

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
 *         description: Invalid request (missing question)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIErrorResponse'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, aiController.askAI.bind(aiController));

export default router;
