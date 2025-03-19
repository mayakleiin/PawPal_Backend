import PlaydateModel, { IPlaydate } from "../models/playdate_model";
import createController, { BaseController } from "./base_controller";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Create base controller
const basePlaydateController = createController<IPlaydate>(PlaydateModel);

// Extend for extra methods
class PlaydateController extends BaseController<IPlaydate> {
  constructor() {
    super(PlaydateModel);
  }

  // Add participant
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.query.userId;
      const { dogIds } = req.body;

      const playdate = await PlaydateModel.findById(id);
      if (!playdate) {
        res.status(404).json({ error: "Playdate not found" });
        return;
      }

      const alreadyParticipant = playdate.participants.some(
        (p) => p.userId.toString() === userId
      );
      if (alreadyParticipant) {
        res.status(400).json({ error: "User already participating" });
        return;
      }

      playdate.participants.push({
        userId: new mongoose.Types.ObjectId(userId as string),
        dogIds,
      });

      await playdate.save();
      res.status(200).json({ message: "Participation confirmed", playdate });
    } catch (error) {
      res
        .status(400)
        .json({ error: "Failed to add participant", details: error });
    }
  }

  // Remove participant
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.query.userId;

      const playdate = await PlaydateModel.findById(id);
      if (!playdate) {
        res.status(404).json({ error: "Playdate not found" });
        return;
      }

      const participant = playdate.participants.find(
        (p) => p.userId.toString() === userId
      );
      if (!participant) {
        res.status(400).json({ error: "User not participating" });
        return;
      }

      playdate.participants = playdate.participants.filter(
        (p) => p.userId.toString() !== userId
      );

      await playdate.save();
      res.status(200).json({ message: "Participation removed", playdate });
    } catch (error) {
      res
        .status(400)
        .json({ error: "Failed to remove participant", details: error });
    }
  }
}

export const playdateController = new PlaydateController();
export default basePlaydateController;
