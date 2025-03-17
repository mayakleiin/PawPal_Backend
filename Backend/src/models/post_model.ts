import mongoose, { Document, Schema } from "mongoose";

// Define TypeScript interface for a Post (extends Mongoose Document)
export interface IPost extends Document {
  title: string;
  description?: string; // Optional description field
  image?: string; // Optional image URL
  owner: string; // User ID who created the post
  likes: string[]; // Array of user IDs who liked the post
  comments: string[]; // Array of comment IDs
}

// Define Mongoose schema for Post
const postSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  owner: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: String, // Storing user IDs as strings
    },
  ],
  comments: [
    {
      type: String, // Storing comment IDs as strings
    },
  ],
});

// Create Post model
const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;
