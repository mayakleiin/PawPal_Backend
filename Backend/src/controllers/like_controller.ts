import { Request, Response } from "express";
import PostModel from "../models/post_model";
import logger from "../utils/logger";

// Toggle like on a post: Add like if not liked, remove like if already liked
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: No user ID provided" });
      return;
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const hasLiked = post.likes.includes(userId as any);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId as any);
    }

    await post.save();

    res.status(200).json({ likes: post.likes.length, liked: !hasLiked });
    return; 
  } catch (error) {
    logger.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
