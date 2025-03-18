import mongoose, { Document, Schema } from "mongoose";

// Interface for a Comment document in MongoDB
export interface IComment extends Document {
  content: string;
  owner: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Comment model Schema
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true, 
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true } 
);

const CommentModel = mongoose.model<IComment>("Comments", commentSchema);
export default CommentModel;
