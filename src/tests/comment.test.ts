import request from "supertest";
import mongoose from "mongoose";
import initApp from "../server";
import postModel from "../models/post_model";
import userModel from "../models/user_model";
import commentModel from "../models/comment_model";
import { Express } from "express";

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

const tokens = {
  accessToken: "",
  userId: "",
};

const secondTokens = {
  accessToken: "",
  userId: "",
};

let postId = "";
let commentId = "";

beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany({});
  await userModel.deleteMany({});
  await commentModel.deleteMany({});

  // Register & login first user
  const regRes = await request(app).post("/api/auth/register").send(testUser);
  expect(regRes.statusCode).toBe(200);
  const loginRes = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  tokens.accessToken = loginRes.body.accessToken;
  tokens.userId = loginRes.body.user._id;

  // Register & login second user
  const regRes2 = await request(app)
    .post("/api/auth/register")
    .send(secondUser);
  expect(regRes2.statusCode).toBe(200);
  const loginRes2 = await request(app).post("/api/auth/login").send({
    email: secondUser.email,
    password: secondUser.password,
  });
  secondTokens.accessToken = loginRes2.body.accessToken;
  secondTokens.userId = loginRes2.body.user._id;

  // Create post
  const postRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${tokens.accessToken}`)
    .send({ title: "Post for comments", content: "Testing comments" });
  postId = postRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Comments Test Suite", () => {
  test("Get all comments - empty initially", async () => {
    const res = await request(app).get("/api/comments");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
    expect(res.body.totalItems).toBe(0);
    expect(res.body.currentPage).toBe(1);
  });

  test("Create comment - Success", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({ content: "First comment", postId });
    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("First comment");
    commentId = res.body._id;
  });

  test("Create comment - Fail without token", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ content: "No token", postId });
    expect(res.statusCode).toBe(401);
  });

  test("Get comment by ID - Success", async () => {
    const res = await request(app).get(`/api/comments/${commentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(commentId);
  });

  test("Update comment - Success", async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({ content: "Updated comment" });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe("Updated comment");
  });

  test("Update comment - Fail with second user token", async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`)
      .send({ content: "Should not update" });
    expect(res.statusCode).toBe(401);
  });

  test("Delete comment - Fail with second user token", async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`);
    expect(res.statusCode).toBe(401);
  });

  test("Delete comment - Success", async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
  });

  test("Delete comment - Already deleted", async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(404);
  });

  test("Update comment - Fail invalid token", async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set("Authorization", "Bearer invalidtoken")
      .send({ content: "Fail" });
    expect(res.statusCode).toBe(401);
  });

  test("Delete comment - Fail invalid token", async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
  });
});
