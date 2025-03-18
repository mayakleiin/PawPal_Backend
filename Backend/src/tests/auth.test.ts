import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});
  console.log("BeforeAll – DB cleaned");
});

afterAll(async () => {
  console.log("AfterAll – closing DB connection");
  await mongoose.connection.close();
});

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "123456",
};

const tokens = {
  accessToken: "",
  refreshToken: "",
};

describe("Auth Tests Suite", () => {
  test("Register - Success", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe(testUser.email);
  });

  test("Register - Fail duplicate email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Email already exists.");
  });

  test("Register - Fail missing fields", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "fail@example.com",
      password: "123456",
    });
    expect(response.statusCode).toBe(400);
  });

  test("Login - Success", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    tokens.accessToken = response.body.accessToken;
    tokens.refreshToken = response.body.refreshToken;
  });

  test("Login - Fail wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpass",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Incorrect email or password");
  });

  test("Login - Fail wrong email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "notexists@example.com",
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Incorrect email or password");
  });

  test("Login - Fail missing fields", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
    });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh Token - Success", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    tokens.accessToken = response.body.accessToken;
    tokens.refreshToken = response.body.refreshToken;
  });

  test("Refresh Token - Fail invalid token", async () => {
    const response = await request(app).post("/api/auth/refresh").send({
      refreshToken: "invalidToken",
    });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh Token - Fail missing refresh token", async () => {
    const response = await request(app).post("/api/auth/refresh").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Refresh token is required");
  });

  test("Logout - Success", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: tokens.refreshToken });
    expect(response.statusCode).toBe(200);
  });

  test("Logout - Fail missing refresh token", async () => {
    const response = await request(app).post("/api/auth/logout").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Refresh token is required");
  });

  test("Refresh Token - Fail after logout (token invalid)", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh Token - Fail if user deleted", async () => {
    // Register a new user
    const res1 = await request(app).post("/api/auth/register").send({
      name: "ToDelete",
      email: "delete@example.com",
      password: "123456",
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await request(app).post("/api/auth/login").send({
      email: "delete@example.com",
      password: "123456",
    });
    expect(res2.statusCode).toBe(200);
    const refreshToken = res2.body.refreshToken;

    // Delete user manually
    await userModel.deleteOne({ email: "delete@example.com" });

    // Try to refresh token
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("User not found");
  });

  test("Missing TOKEN_SECRET - Login", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.statusCode).toBe(400);

    process.env.TOKEN_SECRET = originalSecret;
  });

  test("Missing TOKEN_SECRET - Refresh", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: tokens.refreshToken });
    expect(response.statusCode).toBe(400);

    process.env.TOKEN_SECRET = originalSecret;
  });

  test("Missing TOKEN_SECRET - Logout", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: tokens.refreshToken });
    expect(response.statusCode).toBe(400);

    process.env.TOKEN_SECRET = originalSecret;
  });
});
