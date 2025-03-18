import express from "express";
import basePlaydateController, {
  playdateController,
} from "../controllers/playdate_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

// Base CRUD routes
router.post(
  "/",
  authMiddleware,
  basePlaydateController.create.bind(basePlaydateController)
);
router.get("/", basePlaydateController.getAll.bind(basePlaydateController));
router.get("/:id", basePlaydateController.getById.bind(basePlaydateController));
router.patch(
  "/:id",
  authMiddleware,
  basePlaydateController.update.bind(basePlaydateController)
);
router.delete(
  "/:id",
  authMiddleware,
  basePlaydateController.delete.bind(basePlaydateController)
);

// Participant routes
router.post(
  "/:id/attend",
  authMiddleware,
  playdateController.addParticipant.bind(playdateController)
);
router.delete(
  "/:id/attend",
  authMiddleware,
  playdateController.removeParticipant.bind(playdateController)
);

export default router;
