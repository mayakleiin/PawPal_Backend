import express from "express";
import authController from "../controllers/auth_controller";

const router = express.Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Logout user
router.post("/logout", authController.logout);

// Refresh token
router.post("/refresh", authController.refresh);

export default router;
