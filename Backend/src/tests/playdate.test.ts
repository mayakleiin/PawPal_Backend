import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import playdateModel from "../models/playdate_model";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});
  await playdateModel.deleteMany({});
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
  dogs: [{ name: "Doggo", birthYear: 2020, birthMonth: 5, breed: "Labrador" }],
};

const secondUser = {
  name: "Other User",
  email: "other@example.com",
  password: "654321",
};

const tokens = {
  user1: "",
  user2: "",
};

let playdateId = "";

describe("Playdates Tests Suite", () => {
  // Register users
  test("Register User1", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(200);
  });

  test("Register User2", async () => {
    const res = await request(app).post("/api/auth/register").send(secondUser);
    expect(res.statusCode).toBe(200);
  });

  // Login users
  test("Login User1", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    tokens.user1 = res.body.accessToken;
  });

  test("Login User2", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: secondUser.email, password: secondUser.password });
    expect(res.statusCode).toBe(200);
    tokens.user2 = res.body.accessToken;
  });

  // DB empty check
  test("Get All Playdates when DB empty", async () => {
    const res = await request(app).get("/api/playdates");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  // Create Playdate
  test("Create Playdate - Success", async () => {
    const res = await request(app)
      .post("/api/playdates")
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({
        title: "Park Meeting",
        description: "Fun at park",
        date: "2025-04-01",
        location: "Central Park",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Park Meeting");
    playdateId = res.body._id;
  });

  test("Create Playdate - Fail without token", async () => {
    const res = await request(app).post("/api/playdates").send({
      title: "No Token",
      date: "2025-04-01",
      location: "Park",
    });
    expect(res.statusCode).toBe(401);
  });

  test("Create Playdate - Fail missing fields", async () => {
    const res = await request(app)
      .post("/api/playdates")
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({
        date: "2025-04-01",
      });
    expect(res.statusCode).toBe(400);
  });

  // Get All
  test("Get All Playdates - After Creation", async () => {
    const res = await request(app).get("/api/playdates");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // Get by ID
  test("Get Playdate by ID - Success", async () => {
    const res = await request(app).get(`/api/playdates/${playdateId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(playdateId);
  });

  test("Get Playdate by ID - Fail non-existing", async () => {
    const res = await request(app).get(
      `/api/playdates/${new mongoose.Types.ObjectId()}`
    );
    expect(res.statusCode).toBe(404);
  });

  test("Get Playdate by ID - Fail invalid ID", async () => {
    const res = await request(app).get(`/api/playdates/invalidID`);
    expect(res.statusCode).toBe(400);
  });

  // Update
  test("Update Playdate - Success by owner", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${playdateId}`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ location: "Updated Park" });
    expect(res.statusCode).toBe(200);
  });

  test("Update Playdate - Fail by other user", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${playdateId}`)
      .set("Authorization", `Bearer ${tokens.user2}`)
      .send({ location: "Hack Attempt" });
    expect(res.statusCode).toBe(401);
  });

  test("Update Playdate - Fail non-existing", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ location: "Nothing" });
    expect(res.statusCode).toBe(404);
  });

  test("Update Playdate - Fail no token", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${playdateId}`)
      .send({ location: "Fail" });
    expect(res.statusCode).toBe(401);
  });

  // Delete
  test("Delete Playdate - Fail by other user", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${playdateId}`)
      .set("Authorization", `Bearer ${tokens.user2}`);
    expect(res.statusCode).toBe(401);
  });

  test("Delete Playdate - Fail non-existing", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(404);
  });

  test("Delete Playdate - Fail no token", async () => {
    const res = await request(app).delete(`/api/playdates/${playdateId}`);
    expect(res.statusCode).toBe(401);
  });

  test("Delete Playdate - Success by owner", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${playdateId}`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(200);
  });
});
