import axios from "axios";
import { Request, Response } from "express";
import createController, { BaseController } from "./base_controller";
import logger from "../utils/logger";

// AI Controller - No database model needed
class AIController {
  constructor() {}

  // Fetch AI-generated response
  async askAI(req: Request, res: Response): Promise<void> {
    try {
      const { question } = req.body;

      // Validate request payload
      if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      // Log the AI request
      logger.info(`AI Request: ${question}`);

      // Send request to Google Gemini API
      const geminiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [{ parts: [{ text: question }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          },
        }
      );

      // Extract response from API
      const data = geminiResponse.data as {
        candidates?: { content?: { parts?: { text: string }[] } }[]
      };
      const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      // Log AI response
      logger.info(`AI Response: ${answer}`);

      // Send response back to client
      res.status(200).json({ answer });
    } catch (error: any) {
      logger.error("Failed to fetch AI response", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch AI response" });
    }
  }
}

// Export AI controller instance
export const aiController = new AIController();
export default aiController;
