import express from "express";
import userController from "../controllers/user_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

// User routes
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/:userId", authMiddleware, userController.getUserById);
router.put("/:userId", authMiddleware, userController.updateUserDetails);
router.delete("/:userId", authMiddleware, userController.deleteUser);

// Dog routes
router.post("/:userId/dogs", authMiddleware, userController.addDog);
router.put("/:userId/dogs/:dogId", authMiddleware, userController.updateDog);
router.delete("/:userId/dogs/:dogId", authMiddleware, userController.deleteDog);

export default router;
