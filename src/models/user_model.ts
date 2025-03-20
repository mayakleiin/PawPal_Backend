import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Interface for Dog
export interface IDog {
  name: string;
  birthYear: number;
  birthMonth: number;
  breed?: string;
  image?: string;
  _id?: string;
}

// Interface for User
export interface IUser {
  name: string;
  email: string;
  password: string;
  city?: string;
  gender?: "Male" | "Female" | "Other";
  profileImage?: string;
  dogs: IDog[];
  _id?: string;
  refreshToken?: string[];
}

// Dog Schema
const dogSchema = new Schema<IDog>(
  {
    name: { type: String, required: true },
    birthYear: { type: Number, required: true },
    birthMonth: { type: Number, required: true },
    breed: { type: String },
    image: { type: String, default: "/public/dogs/dog_default.JPG" },
  },
  { _id: true }
);

// Virtual field for age
dogSchema.virtual("age").get(function () {
  const today = new Date();
  let age = today.getFullYear() - this.birthYear;
  const m = today.getMonth() + 1 - this.birthMonth;
  if (m < 0) {
    age--;
  }
  return age;
});

// User Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  profileImage: {
    type: String,
    default: "/public/users/user_default.png",
  },
  dogs: [dogSchema],
  refreshToken: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model<IUser>("Users", userSchema);
export default User;
