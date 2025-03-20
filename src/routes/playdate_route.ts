import express from "express";
import basePlaydateController, {
  playdateController,
} from "../controllers/playdate_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Playdates
 *     description: API for managing playdates and participants
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Playdate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         location:
 *           type: string
 *         owner:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               dogIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     CreatePlaydateRequest:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - location
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         location:
 *           type: string
 *     UpdatePlaydateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         location:
 *           type: string
 *     ParticipantRequest:
 *       type: object
 *       properties:
 *         dogIds:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /playdates:
 *   get:
 *     summary: Get all playdates
 *     tags: [Playdates]
 *     responses:
 *       200:
 *         description: List of all playdates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playdate'
 */
router.get("/", basePlaydateController.getAll.bind(basePlaydateController));

/**
 * @swagger
 * /playdates/{id}:
 *   get:
 *     summary: Get playdate by ID
 *     tags: [Playdates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playdate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playdate'
 *       404:
 *         description: Playdate not found
 */
router.get("/:id", basePlaydateController.getById.bind(basePlaydateController));

/**
 * @swagger
 * /playdates:
 *   post:
 *     summary: Create a new playdate
 *     tags: [Playdates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlaydateRequest'
 *     responses:
 *       201:
 *         description: Playdate created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  basePlaydateController.create.bind(basePlaydateController)
);

/**
 * @swagger
 * /playdates/{id}:
 *   patch:
 *     summary: Update a playdate
 *     tags: [Playdates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlaydateRequest'
 *     responses:
 *       200:
 *         description: Playdate updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playdate not found
 */
router.patch(
  "/:id",
  authMiddleware,
  basePlaydateController.update.bind(basePlaydateController)
);

/**
 * @swagger
 * /playdates/{id}:
 *   delete:
 *     summary: Delete a playdate
 *     tags: [Playdates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playdate deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playdate not found
 */
router.delete(
  "/:id",
  authMiddleware,
  basePlaydateController.delete.bind(basePlaydateController)
);

/**
 * @swagger
 * /playdates/{id}/attend:
 *   post:
 *     summary: Add participant to playdate
 *     tags: [Playdates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantRequest'
 *     responses:
 *       200:
 *         description: Participation confirmed
 *       400:
 *         description: Already participating or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playdate not found
 */
router.post(
  "/:id/attend",
  authMiddleware,
  playdateController.addParticipant.bind(playdateController)
);

/**
 * @swagger
 * /playdates/{id}/attend:
 *   delete:
 *     summary: Remove participant from playdate
 *     tags: [Playdates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participation removed
 *       400:
 *         description: Not participating
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playdate not found
 */
router.delete(
  "/:id/attend",
  authMiddleware,
  playdateController.removeParticipant.bind(playdateController)
);

export default router;
