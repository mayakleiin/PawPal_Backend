import User, { IUser } from "../models/user_model";
import { IDog } from "../models/user_model";

// Get All Users
const getAllUsers = async () => {
  return await User.find();
};

// Get User By Id
const getUserById = async (id: string) => {
  return await User.findById(id);
};

// Update User
const updateUserDetails = async (
  userId: string,
  updatedData: Partial<IUser>
) => {
  return await User.findByIdAndUpdate(userId, updatedData, { new: true });
};

// Delete User
const deleteUser = async (userId: string) => {
  return await User.findByIdAndDelete(userId);
};

// Add a dog to user
const addDog = async (userId: string, dog: IDog) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      $push: { dogs: dog },
    },
    { new: true }
  );
};

// Update a dog of user
const updateDog = async (userId: string, dogId: string, updatedDog: IDog) => {
  return await User.findOneAndUpdate(
    { _id: userId, "dogs._id": dogId },
    { $set: { "dogs.$": updatedDog } },
    { new: true }
  );
};

// Delete a dog of user
const deleteDog = async (userId: string, dogId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { dogs: { _id: dogId } } },
    { new: true }
  );
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
