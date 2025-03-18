import express from "express"; 
const router = express.Router();
import postsController from "../controllers/post_controller";
import { authMiddleware } from "../middleware/auth_middleware";

//Protect routes that require authentication
router.post("/", authMiddleware, postsController.create.bind(postsController)); // Create a new post (requires authentication)
router.put("/:id", authMiddleware, postsController.update.bind(postsController)); // Update a post (requires authentication)
router.delete("/:id", authMiddleware, postsController.delete.bind(postsController)); // Delete a post (requires authentication)

//Public routes that do not require authentication
router.get("/", postsController.getAll.bind(postsController)); // Get all posts
router.get("/:id", postsController.getById.bind(postsController)); // Get a specific post by ID

export default router;
