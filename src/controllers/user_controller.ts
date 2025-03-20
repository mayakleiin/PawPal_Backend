import { Request, Response } from "express";
import userService from "../services/user_service";
import logger from "../utils/logger";
import mongoose from "mongoose";

const defaultUserImage = "/public/users/user_default.png";
const defaultDogImage = "/public/dogs/dog_default.png";

// Get All Users
const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    logger.error("Error while getting users: " + error);
    res.status(500).json({ message: "Error while getting users" });
  }
};

// Get User By Id
const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // New check
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid User ID format" });
      return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error("Error while getting user: " + error);
    res.status(500).json({ message: "Error while getting user" });
  }
};

// Update User Details
const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check ownership
    if (req.query.userId !== userId) {
      res.status(401).json({ message: "Unauthorized to update this user" });
      return;
    }

    // Get name, city, gender and profileImage from body
    const { name, city, gender, profileImage } = req.body;

    const updatedUser = await userService.updateUserDetails(userId, {
      name,
      city,
      gender,
      profileImage: profileImage || defaultUserImage,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error("Error while updating user: " + error);
    res.status(500).json({ message: "Error while updating user" });
  }
};

// Delete User
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check ownership
    if (req.query.userId !== userId) {
      res.status(401).json({ message: "Unauthorized to delete this user" });
      return;
    }

    const deletedUser = await userService.deleteUser(userId);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error while deleting user: " + error);
    res.status(500).json({ message: "Error while deleting user" });
  }
};

// Add Dog
const addDog = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, birthYear, birthMonth, breed, image } = req.body;

    const dogData = {
      name,
      birthYear,
      birthMonth,
      breed,
      image: image || defaultDogImage,
    };

    const user = await userService.addDog(userId, dogData);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error("Error while adding dog: " + error);
    res.status(500).json({ message: "Error while adding dog" });
  }
};

// Update Dog
const updateDog = async (req: Request, res: Response) => {
  try {
    const { userId, dogId } = req.params;
    const { name, birthYear, birthMonth, breed, image } = req.body;

    const dogData = {
      name,
      birthYear,
      birthMonth,
      breed,
      image: image || defaultDogImage,
    };

    const user = await userService.updateDog(userId, dogId, dogData);
    if (!user) {
      res.status(404).json({ message: "User or dog not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error("Error while updating dog: " + error);
    res.status(500).json({ message: "Error while updating dog" });
  }
};

// Delete Dog
const deleteDog = async (req: Request, res: Response) => {
  try {
    const { userId, dogId } = req.params;
    const user = await userService.deleteDog(userId, dogId);
    if (!user) {
      res.status(404).json({ message: "User or dog not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error("Error while deleting dog: " + error);
    res.status(500).json({ message: "Error while deleting dog" });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserDetails,
  deleteUser,
  addDog,
  updateDog,
  deleteDog,
};
