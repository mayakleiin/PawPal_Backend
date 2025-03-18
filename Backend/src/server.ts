import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import path from "path";
import authRoutes from "./routes/auth_route";

import postRoutes from "./routes/post_route"; // Import post routes
dotenv.config();
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/auth", authRoutes);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const initApp = async () => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;
    db.on("error", (error) => {
      console.error(error);
    });
    db.once("open", function () {
      console.log("Connected to Mongoose");
    });
    if (!process.env.DB_CONNECT) {
      reject("No DB_CONNECT");
    } else {
      mongoose.connect(process.env.DB_CONNECT).then(() => {
        resolve(app);
      });
    }
  });
};

export default initApp;
