import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";

let app: any;
let token: string;
let commentId: string;
let postId = "6603ab12c2f3e66f1a1b1234"; // Example post ID

beforeAll(async () => {
  app = await initApp();

  // Authenticate and retrieve a valid token
  const authResponse = await request(app)
    .post("/auth/login")
    .send({ email: "user@example.com", password: "password123" });

  token = authResponse.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Create a new comment
test("Should create a new comment", async () => {
  const response = await request(app)
    .post("/comments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      content: "This is a test comment",
      postId: postId,
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty("_id");
  expect(response.body.content).toBe("This is a test comment");

  commentId = response.body._id;
});

// Fetch all comments
test("Should fetch all comments", async () => {
  const response = await request(app).get("/comments");

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

// Fetch a single comment by ID
test("Should fetch a single comment by ID", async () => {
  const response = await request(app).get(`/comments/${commentId}`);

  expect(response.status).toBe(200);
  expect(response.body._id).toBe(commentId);
});

// Update a comment
test("Should update a comment", async () => {
  const response = await request(app)
    .put(`/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      content: "Updated test comment",
    });

  expect(response.status).toBe(200);
  expect(response.body.content).toBe("Updated test comment");
});

// Delete a comment
test("Should delete a comment", async () => {
  const response = await request(app)
    .delete(`/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
});
