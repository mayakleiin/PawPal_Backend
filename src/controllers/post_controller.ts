import PostModel, { IPost } from "../models/post_model";
import createController, { BaseController } from "./base_controller";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Create base controller
const basePostsController = createController<IPost>(PostModel);

class PostsController extends BaseController<IPost> {
  constructor() {
    super(PostModel);
  }

  // Like a post
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      const post = await PostModel.findById(id);
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      if (post.likes.includes(new mongoose.Types.ObjectId(userId))) {
        res.status(400).json({ error: "Post already liked" });
        return;
      }

      post.likes.push(new mongoose.Types.ObjectId(userId));
      await post.save();

      res
        .status(200)
        .json({ message: "Post liked", likesCount: post.likes.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to like post", details: error });
    }
  }

  // Unlike a post
  async unlikePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      const post = await PostModel.findById(id);
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Check if user liked the post
      if (!post.likes.some((like) => like.toString() === userId)) {
        res.status(400).json({ error: "Post not liked yet" });
        return;
      }

      // Remove like
      post.likes = post.likes.filter((uid) => uid.toString() !== userId);
      await post.save();

      res
        .status(200)
        .json({ message: "Post unliked", likesCount: post.likes.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to unlike post", details: error });
    }
  }
}

export const postsController = new PostsController();
export default basePostsController;
