import { Request, Response } from "express";
import axios from "axios";
import { BaseController } from "./base_controller";
import logger from "../utils/logger";

class AIController extends BaseController<any> {
  constructor() {
    super(null as any);
  }

  //Fetch AI-generated response using OpenAI (ChatGPT Free Model)
  async getAIResponse(req: Request, res: Response): Promise<void> {
    try {
      const { question } = req.body;

      // Validate input - question is required
      if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      logger.info(`AI request received: ${question}`);

      // Sending request to OpenAI API (using free model gpt-3.5-turbo)
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo", // Ensuring free-tier usage
          messages: [{ role: "user", content: question }],
          max_tokens: 150, // Limiting response size to avoid unnecessary usage
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Using API Key from .env file
            "Content-Type": "application/json",
          },
        }
      );

      // Extract AI-generated answer
      const aiAnswer = (response.data as { choices: { message: { content: string } }[] }).choices[0].message.content;
      logger.info(`AI response received: ${aiAnswer}`);

      // Send response back to the user
      res.status(200).json({ answer: aiAnswer });
    } catch (error) {
      logger.error("Error fetching AI response:", error);
      res.status(500).json({ error: "Failed to fetch AI response" });
    }
  }
}

// Creating AIController instance
export const aiController = new AIController();
