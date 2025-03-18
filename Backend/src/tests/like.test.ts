import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";

let app: any;
let token: string;
let postId = "6603ab12c2f3e66f1a1b1234"; // Example post ID

beforeAll(async () => {
  app = await initApp();

  // Authenticate and get a valid token
  const authResponse = await request(app)
    .post("/auth/login")
    .send({ email: "user@example.com", password: "password123" });

  token = authResponse.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Toggle like on a post
test("Should toggle like on a post", async () => {
  const response = await request(app)
    .post(`/posts/${postId}/like`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("likes");
  expect(typeof response.body.likes).toBe("number");
});
