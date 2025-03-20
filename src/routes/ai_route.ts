import express from "express";
const router = express.Router();
import { aiController } from "../controllers/ai_controller";
import { authMiddleware } from "../middleware/auth_middleware";

// Protect AI request route (requires authentication)
router.post("/", authMiddleware, aiController.askAI.bind(aiController));

export default router;
