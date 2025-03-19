import PostModel, { IPost } from "../models/post_model";
import createController, { BaseController } from "./base_controller";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { getPagination } from "../utils/pagination";
import logger from "../utils/logger";

// Create base controller
const basePostsController = createController<IPost>(PostModel);

class PostsController extends BaseController<IPost> {
  constructor() {
    super(PostModel);
  }

  //Fetch paginated posts
  async getPaginatedPosts(req: Request, res: Response): Promise<void> {
    try {
      // Extract pagination parameters from the request
      const { skip, limit } = getPagination(req.query);

      // Retrieve paginated posts from the database
      const posts = await PostModel.find()
        .sort({ createdAt: -1 }) // Sort from newest to oldest
        .skip(skip)
        .limit(limit);

      // Count total posts for pagination calculation
      const totalPosts = await PostModel.countDocuments();

      // Log pagination request details
      logger.info(
        `Fetched ${posts.length} posts (Page: ${
          req.query.page || 1
        }, Limit: ${limit})`
      );

      // Send paginated response
      res.status(200).json({
        posts,
        currentPage: parseInt(req.query.page as string) || 1,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      });
    } catch (error) {
      logger.error("Error fetching paginated posts:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
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

  //Unlike a post
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
