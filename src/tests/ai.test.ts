import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

let app: Express;
let validToken: string;

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      candidates: [{ content: { parts: [{ text: "Mock AI Response" }] } }],
    },
  }),
}));

beforeAll(async () => {
  app = await initApp();

  // Register user
  await request(app).post("/api/auth/register").send({
    email: "testai@test.com",
    password: "123456",
    name: "Test AI",
    city: "TestCity",
    gender: "female",
  });

  // Login user to get token
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "testai@test.com",
    password: "123456",
  });

  validToken = `Bearer ${loginResponse.body.accessToken}`;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("AI Route Tests", () => {
  it("should return AI response for valid question", async () => {
    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", validToken)
      .send({ question: "How can I train my dog?" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("answer");
  });

  it("should return 400 for irrelevant question", async () => {
    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", validToken)
      .send({ question: "What is the weather today?" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Question must be related to dogs, training, or play."
    );
  });

  it("should return 400 for missing question", async () => {
    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", validToken)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Question is required");
  });

  it("should return 401 for missing token", async () => {
    const response = await request(app)
      .post("/api/ai")
      .send({ question: "How can I train my dog?" });

    expect(response.status).toBe(401);
  });

  it("should return 429 when exceeding rate limit", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/ai")
        .set("Authorization", validToken)
        .send({ question: "How can I train my dog?" });
    }

    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", validToken)
      .send({ question: "How can I train my dog?" });

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty(
      "error",
      "Too many AI requests, please try again later."
    );
  });
});
