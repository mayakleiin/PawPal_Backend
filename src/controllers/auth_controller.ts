import { Request, Response } from "express";
import authService from "../services/auth_service";

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, city } = req.body;
    if (!email || !password || !name) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required." });
      return;
    }

    let profileImage: string | undefined = undefined;
    if (req.file) {
      profileImage = `/users/${req.file.filename}`;
    }

    const result = await authService.register({
      name,
      email,
      password,
      profileImage,
      city,
    });
    res.status(200).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (err: unknown) {
    // Handle multer errors
    if (
      err instanceof Error &&
      err.message === "Only image files are allowed!"
    ) {
      res.status(400).json({ message: "Only image files are allowed!" });
      return;
    }

    // Handle duplicate email error from MongoDB
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === 11000 &&
      "keyPattern" in err &&
      err.keyPattern &&
      (err.keyPattern as { email?: string }).email
    ) {
      res
        .status(400)
        .json({ message: "Email address already exists in the system" });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during registration" });
    }
  }
};

// Google sign in
const googleSignin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ message: "Google credential is required." });
      return;
    }

    const result = await authService.googleSignin(credential);

    res.status(200).json({
      message: "User logged in with Google successfully",
      ...result,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during Google login." });
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
  } catch (err: unknown) {
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
  } catch (err: unknown) {
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res
        .status(400)
        .json({ message: "An unknown error occurred during token refresh." });
    }
  }
};

export default { register, login, logout, refresh, googleSignin };
