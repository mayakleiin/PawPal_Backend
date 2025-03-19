import { Request, Response } from "express";
import authService from "../services/auth_service";

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required." });
      return;
    }
    const user = await authService.register({ name, email, password });
    res.status(200).json({
      message: "User registered successfully",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    // Handle duplicate email error from MongoDB
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during registration." });
    }
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }
    const result = await authService.login({ email, password });
    res.status(200).json({
      message: "User logged in successfully",
      ...result,
    });
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during login." });
    }
  }
};

// Logout
const logout = async (req: Request, res: Response) => {
  try {
    if (!req.body.refreshToken) {
      res.status(400).json({ message: "Refresh token is required." });
      return;
    }
    await authService.logout(req.body.refreshToken);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during logout." });
    }
  }
};

// Refresh tokens
const refresh = async (req: Request, res: Response) => {
  try {
    if (!req.body.refreshToken) {
      res.status(400).json({ message: "Refresh token is required." });
      return;
    }
    const tokens = await authService.refresh(req.body.refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      ...tokens,
    });
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during token refresh." });
    }
  }
};

export default { register, login, logout, refresh };
