import express from "express";
const router = express.Router();
import { postsController } from "../controllers/post_controller";
import basePostsController from "../controllers/post_controller";
import { authMiddleware } from "../middleware/auth_middleware";

// Protect routes
router.post(
  "/",
  authMiddleware,
  basePostsController.create.bind(basePostsController)
);
router.put(
  "/:id",
  authMiddleware,
  basePostsController.update.bind(basePostsController)
);
router.delete(
  "/:id",
  authMiddleware,
  basePostsController.delete.bind(basePostsController)
);

// Like & Unlike routes
router.post(
  "/:id/like",
  authMiddleware,
  postsController.likePost.bind(postsController)
);
router.delete(
  "/:id/like",
  authMiddleware,
  postsController.unlikePost.bind(postsController)
);

// Public routes
router.get("/", postsController.getAll.bind(postsController));
router.get("/:id", basePostsController.getById.bind(basePostsController));

export default router;
