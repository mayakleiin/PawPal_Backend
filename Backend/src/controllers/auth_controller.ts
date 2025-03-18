import { Request, Response } from "express";
import authService from "../services/auth_service";

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }
    const user = await authService.register({ name, email, password });
    res.status(200).json({
      message: "User registered successfully",
      user: { id: user._id, email: user.email, name: user.fullName },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};

// Logout
const logout = async (req: Request, res: Response) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};

// Refresh tokens
const refresh = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.status(200).json(tokens);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};

export default { register, login, logout, refresh };
