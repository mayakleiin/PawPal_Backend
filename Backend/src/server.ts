import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors"; // Enable CORS for cross-origin requests

import postRoutes from "./routes/post_route"; // Import post routes

dotenv.config();
const app = express();

const initApp = (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      console.log("Connected to the database");
    });

    if (!process.env.DB_CONNECT) {
      reject("DB_CONNECT is not defined");
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          app.use(bodyParser.json());
          app.use(bodyParser.urlencoded({ extended: true }));
          app.use(cors()); //Enables CORS for all routes

          //Register API routes
          app.use("/posts", postRoutes); // Connect the post routes

          //Default API route
          app.get("/", (_req, res) => {
            res.send("PawPal API is running");
          });

          resolve(app);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });
};

export default initApp;
