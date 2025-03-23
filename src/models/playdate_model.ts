import mongoose, { Document } from "mongoose";
const Schema = mongoose.Schema;

// Interface for Participant
export interface IParticipant {
  userId: mongoose.Types.ObjectId;
  dogIds: string[]; // IDs of the user's dogs
}

// Interface for Playdate
export interface IPlaydate extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  owner: mongoose.Types.ObjectId;
  participants: IParticipant[];
}

// Participant Schema
const participantSchema = new Schema<IParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  dogIds: [{ type: String }],
});

// Playdate Schema
const playdateSchema = new Schema<IPlaydate>({
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  participants: { type: [participantSchema], default: [] },
});

const Playdate = mongoose.model<IPlaydate>("Playdate", playdateSchema);
export default Playdate;
