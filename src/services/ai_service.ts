import axios from "axios";
import type { AxiosError } from "axios/index";
import logger from "../utils/logger";

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

export default class AIService {
  private allowedKeywords = [
    "dog",
    "dogs",
    "puppy",
    "puppies",
    "train",
    "training",
    "play",
    "game",
    "behavior",
    "walk",
    "bark",
  ];

  // Validate if question is relevant
  public isRelevantQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();
    return this.allowedKeywords.some((keyword) =>
      lowerQuestion.includes(keyword)
    );
  }

  // Send request to Google Gemini API
  public async fetchAIResponse(question: string): Promise<string> {
    try {
      logger.info(`AI Request: ${question}`);

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

      const data = geminiResponse.data as {
        candidates?: { content?: { parts?: { text: string }[] } }[];
      };
      const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      logger.info(`AI Response: ${answer}`);
      return answer;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        logger.error(
          "Failed to fetch AI response",
          error.response?.data || error.message
        );
      } else if (typeof error === "object" && (error as Error).message) {
        logger.error("Failed to fetch AI response", (error as Error).message);
      } else {
        logger.error("Unknown error occurred while fetching AI response");
      }
      throw new Error("Failed to fetch AI response");
    }
  }
}
