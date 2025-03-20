import mongoose, { Document, Schema } from "mongoose";

// Interface that defines the structure of a Post document
export interface IPost extends Document {
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId;
  image: {
    type: string;
    default: "";
  };
  createdAt: Date;
  updatedAt: Date;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
}

// Post model Schema
const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: "" },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the Post model
const PostModel = mongoose.model<IPost>("Post", postSchema);
export default PostModel;
