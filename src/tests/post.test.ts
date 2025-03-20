import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import postModel from "../models/post_model";
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

const tokens = {
  accessToken: "",
  userId: "",
};

const secondTokens = {
  accessToken: "",
  userId: "",
};

let postId = "";

beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany({});
  await userModel.deleteMany({});

  // Register first user
  const regRes = await request(app).post("/api/auth/register").send(testUser);
  expect(regRes.statusCode).toBe(200);

  const loginRes = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  tokens.accessToken = loginRes.body.accessToken;
  tokens.userId = loginRes.body.user._id;

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
  secondTokens.userId = loginRes2.body.user._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Posts Test Suite", () => {
  test("Get all posts - empty initially", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
    expect(res.body.totalItems).toBe(0);
    expect(res.body.currentPage).toBe(1);
  });

  test("Create post - Success", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        title: "First Post",
        content: "This is my first post",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("First Post");
    postId = res.body._id;
  });

  test("Create post - Fail without token", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "Unauthorized Post",
      content: "Should fail",
    });
    expect(res.statusCode).toBe(401);
  });

  test("Create post - Fail with invalid token", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer invalidtoken`)
      .send({
        title: "Invalid Token Post",
        content: "Should fail",
      });
    expect(res.statusCode).toBe(401);
  });

  test("Get post by ID - Success", async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(postId);
  });

  test("Get post by ID - Invalid ID format", async () => {
    const res = await request(app).get(`/api/posts/123`);
    expect(res.statusCode).toBe(400);
  });

  test("Update post - Success", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        title: "Updated Title",
        content: "Updated Content",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });

  test("Update post - Fail with second user token", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`)
      .send({
        title: "Should Not Update",
      });
    expect(res.statusCode).toBe(401);
  });

  test("Update post - Fail with invalid token", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer invalidtoken`)
      .send({
        title: "Invalid",
      });
    expect(res.statusCode).toBe(401);
  });

  test("Delete post - Fail with second user token", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${secondTokens.accessToken}`);
    expect(res.statusCode).toBe(401);
  });

  test("Delete post - Success", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(200);
  });

  test("Delete post - Already deleted", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);
    expect(res.statusCode).toBe(404);
  });

  test("Delete post - Fail with invalid token", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer invalidtoken`);
    expect(res.statusCode).toBe(401);
  });

  test("Update post - Fail for non-existing post", async () => {
    const res = await request(app)
      .put(`/api/posts/609c5e7b8e620e0015b3b8e1`)
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        title: "Not Exist",
      });
    expect(res.statusCode).toBe(404);
  });
});

describe("Post Likes", () => {
  let likePostId = "";

  beforeAll(async () => {
    // Create new post specifically for like tests
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${tokens.accessToken}`)
      .send({
        title: "Post For Likes",
        content: "Testing likes feature",
      });
    likePostId = res.body._id;
  });

  // Reset likes array before each test to ensure clean state
  beforeEach(async () => {
    await postModel.findByIdAndUpdate(likePostId, { likes: [] });
  });

  test("Like post - Success", async () => {
    const res = await request(app)
      .post(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post liked");

    const post = await postModel.findById(likePostId);
    expect(post?.likes).toContainEqual(
      new mongoose.Types.ObjectId(tokens.userId)
    );
  });

  test("Like post - Fail double like", async () => {
    await request(app)
      .post(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    const res = await request(app)
      .post(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Post already liked");
  });

  test("Unlike post - Success", async () => {
    await request(app)
      .post(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    const res = await request(app)
      .delete(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post unliked");

    const post = await postModel.findById(likePostId);
    expect(post?.likes).not.toContainEqual(
      new mongoose.Types.ObjectId(tokens.userId)
    );
  });

  test("Unlike post - Fail if not liked yet", async () => {
    const res = await request(app)
      .delete(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Post not liked yet");
  });

  test("Like post - Fail without token", async () => {
    const res = await request(app).post(`/api/posts/${likePostId}/like`);

    expect(res.statusCode).toBe(401);
  });

  test("Like post - Fail with invalid token", async () => {
    const res = await request(app)
      .post(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer invalidtoken`);

    expect(res.statusCode).toBe(401);
  });

  test("Unlike post - Fail without token", async () => {
    const res = await request(app).delete(`/api/posts/${likePostId}/like`);

    expect(res.statusCode).toBe(401);
  });

  test("Unlike post - Fail with invalid token", async () => {
    const res = await request(app)
      .delete(`/api/posts/${likePostId}/like`)
      .set("Authorization", `Bearer invalidtoken`);

    expect(res.statusCode).toBe(401);
  });

  // Checking Like on non-existing post
  test("Like post - Fail if post does not exist", async () => {
    const res = await request(app)
      .post(`/api/posts/609c5e7b8e620e0015b3b8e1/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(404);
  });

  test("Unlike post - Fail if post does not exist", async () => {
    const res = await request(app)
      .delete(`/api/posts/609c5e7b8e620e0015b3b8e1/like`)
      .set("Authorization", `Bearer ${tokens.accessToken}`);

    expect(res.statusCode).toBe(404);
  });
});
