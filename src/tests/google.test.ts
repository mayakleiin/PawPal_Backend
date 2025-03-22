import userModel from "../models/user_model";
import { Express } from "express";
import initApp from "../server";
import mongoose from "mongoose";
import request from "supertest";

let app: Express;

jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: "googleuser@example.com",
          name: "Google User",
          picture: "http://google.com/pic.jpg",
        }),
      }),
    })),
  };
});

beforeAll(async () => {
  process.env.GOOGLE_CLIENT_ID = "dummy-client-id";
  app = await initApp();
  await userModel.deleteMany({});
  console.log("BeforeAll – DB cleaned");
});

afterAll(async () => {
  console.log("AfterAll – closing DB connection");
  await mongoose.connection.close();
});

describe("Google Sign-In Tests", () => {
  test("Google Sign-In - First time login (register new user)", async () => {
    const response = await request(app)
      .post("/api/auth/google-signin")
      .send({ credential: "dummyGoogleToken" });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe("googleuser@example.com");
    expect(response.body.firstTimeLogin).toBe(true);
  });

  test("Google Sign-In - Login existing user", async () => {
    // First login to create user
    await request(app)
      .post("/api/auth/google-signin")
      .send({ credential: "dummyGoogleToken" });

    // Second login, should recognize user
    const response = await request(app)
      .post("/api/auth/google-signin")
      .send({ credential: "dummyGoogleToken" });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe("googleuser@example.com");
    expect(response.body.firstTimeLogin).toBe(false);
  });
});
