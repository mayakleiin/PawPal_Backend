import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Storage for profile images
const profileImageStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../../../uploads/users"));
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Storage for dog images
const dogImageStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../../../uploads/dogs"));
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter for images
const fileFilter = function (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg formats allowed!"));
  }
};

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter,
});

export const uploadDogImage = multer({
  storage: dogImageStorage,
  fileFilter: fileFilter,
});
