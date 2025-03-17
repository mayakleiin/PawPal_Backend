import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth_service";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

// Middleware to verify JWT token
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      logger.error("Unauthorized");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      logger.error("Token secret is not defined");
      res.status(500).json({ message: "Token secret is not defined" });
      return;
    }
    const payload = await verifyToken(token, process.env.TOKEN_SECRET);
    req.query.userId = payload._id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.error("Token expired");
      res.status(401).json({ message: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error("Invalid token");
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    logger.error("Error while verifying token " + error);
    res.status(500).json({ message: "Error while verifying token", error });
  }
};
