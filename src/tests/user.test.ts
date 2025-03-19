import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";

let app: Express;

const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "123456",
};

const secondUser = {
  name: "Second User",
  email: "seconduser@example.com",
  password: "123456",
};

let userId = "";
let dogId = "";

const tokens = {
  accessToken: "",
  refreshToken: "",
};

const secondTokens = {
  accessToken: "",
};

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});

  // Register first user
  const regRes = await request(app).post("/api/auth/register").send(testUser);
  expect(regRes.statusCode).toBe(200);
  userId = regRes.body.user.id;

  const loginRes = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  tokens.accessToken = loginRes.body.accessToken;
  tokens.refreshToken = loginRes.body.refreshToken;

  // Register second user
  const regRes2 = await request(app)
    .post("/api/auth/register")
    .send(secondUser);
  expect(regRes2.statusCode).toBe(200);

  const loginRes2 = await request(app).post("/api/auth/login").send({
    email: secondUser.email,
    password: secondUser.password,
  });
  secondTokens.accessToken = loginRes2.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Users Test Suite", () => {
  test("Get all users - Success", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Get user by ID - Success", async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(userId);
  });

  test("Get user by ID - Invalid ID", async () => {
    const res = await request(app)
      .get(`/api/users/123`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(400);
  });

  test("Update user details - Success", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        city: "Tel Aviv",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.city).toBe("Tel Aviv");
  });

  test("Update user details - Fail with second user token", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`)
      .send({
        city: "Unauthorized City",
      });
    expect(res.statusCode).toBe(401);
  });

  test("Add dog - Success", async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/dogs`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        name: "Rex",
        birthYear: 2020,
        birthMonth: 5,
        breed: "Labrador",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.dogs.length).toBeGreaterThan(0);
    dogId = res.body.dogs[0]._id;
  });

  test("Update dog - Success", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}/dogs/${dogId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        name: "Rex Updated",
        birthYear: 2019,
        birthMonth: 4,
        breed: "Golden Retriever",
      });
    expect(res.statusCode).toBe(200);
  });

  test("Delete dog - Success", async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/dogs/${dogId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
  });

  test("Delete user - Success", async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
  });

  test("Get user by ID - Fail after deletion", async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(404);
  });

  test("Delete user - Fail with second user token", async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`);
    expect(res.statusCode).toBe(401);
  });

  test("Access without token - Fail", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
  });

  test("Access with invalid token - Fail", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
  });
});
