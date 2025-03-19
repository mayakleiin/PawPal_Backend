import express from "express";
const router = express.Router();
import { aiController } from "../controllers/ai_controller";
import { authMiddleware } from "../middleware/auth_middleware";

// Protect routes - AI interactions require authentication
router.post("/", authMiddleware, aiController.getAIResponse.bind(aiController));

export default router;
