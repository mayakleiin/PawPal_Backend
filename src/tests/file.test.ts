import request from "supertest";
import initApp from "../server";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { Application } from "express";

let app: Application;

beforeAll(async () => {
  app = await initApp();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("File Upload Tests", () => {
  test("upload user image and check file existence", async () => {
    const filePath = path.join(__dirname, "test_pic.jpg");

    const response = await request(app)
      .post("/file?folder=users")
      .attach("file", filePath);

    console.log("Upload Response:", response.body);
    expect(response.statusCode).toBe(200);

    const fileUrl = response.body.url;
    const filename = fileUrl.split("/").pop();
    const filePathOnDisk = path.join(__dirname, `../public/users/${filename}`);

    const fileExists = fs.existsSync(filePathOnDisk);
    expect(fileExists).toBe(true);
  });
});
