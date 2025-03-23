import { Request, Response } from "express";
import AIService from "../services/ai_service";
import logger from "../utils/logger";

class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async askAI(req: Request, res: Response): Promise<void> {
    try {
      const { question } = req.body;

      // Validate request payload
      if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      // Validate if relevant
      if (!this.aiService.isRelevantQuestion(question)) {
        res
          .status(400)
          .json({
            error: "Question must be related to dogs, training, or play.",
          });
        return;
      }

      // Get AI response from Service
      const answer = await this.aiService.fetchAIResponse(question);

      // Send response back to client
      res.status(200).json({ answer });
    } catch (error: unknown) {
      logger.error("Error in AIController", error);
      res.status(500).json({ error: "Failed to fetch AI response" });
    }
  }
}

export const aiController = new AIController();
export default aiController;
