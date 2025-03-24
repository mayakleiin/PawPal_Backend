import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { swaggerSpec, swaggerUi } from "./utils/swagger";
import authRoutes from "./routes/auth_route";
import userRoutes from "./routes/user_route";
import postRoutes from "./routes/post_route";
import commentRoutes from "./routes/comment_route";
import playdateRoutes from "./routes/playdate_route";
import fileRoutes from "./routes/file_route";
import aiRoutes from "./routes/ai_route";
import cors from "cors";

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default route for API status check
app.get("/", (_req, res) => {
  res.send("PawPal API is running");
});
app.use("/public", express.static("public"));
app.use("/file", fileRoutes);

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/playdates", playdateRoutes);
app.use("/api/ai", aiRoutes);

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
          resolve(app);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });
};

export default initApp;
