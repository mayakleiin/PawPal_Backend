import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import playdateModel from "../models/playdate_model";

let app: Express;

// Users & Tokens
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

let crudPlaydateId = "";
let participantPlaydateId = "";

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});
  await playdateModel.deleteMany({});
  console.log("BeforeAll – DB cleaned");

  // Register and login User1
  await request(app).post("/api/auth/register").send(testUser);
  const login1 = await request(app)
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  tokens.user1 = login1.body.accessToken;

  // Register and login User2
  await request(app).post("/api/auth/register").send(secondUser);
  const login2 = await request(app)
    .post("/api/auth/login")
    .send({ email: secondUser.email, password: secondUser.password });
  tokens.user2 = login2.body.accessToken;

  // Create Playdate for CRUD tests
  const resCrud = await request(app)
    .post("/api/playdates")
    .set("Authorization", `Bearer ${tokens.user1}`)
    .send({
      title: "CRUD Playdate",
      description: "For CRUD tests",
      date: "2025-04-01",
      location: "Central Park",
    });
  crudPlaydateId = resCrud.body._id;

  // Create Playdate for Participant tests
  const resParticipant = await request(app)
    .post("/api/playdates")
    .set("Authorization", `Bearer ${tokens.user1}`)
    .send({
      title: "Participant Playdate",
      description: "For participant tests",
      date: "2025-05-01",
      location: "Dog Park",
    });
  participantPlaydateId = resParticipant.body._id;
});

afterAll(async () => {
  console.log("AfterAll – closing DB connection");
  await mongoose.connection.close();
});

describe("Playdates CRUD Tests", () => {
  test("Get All Playdates", async () => {
    const res = await request(app).get("/api/playdates");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);
    expect(res.body.totalItems).toBe(2);
    expect(res.body.currentPage).toBe(1);
  });

  test("Get Playdate by ID - Success", async () => {
    const res = await request(app).get(`/api/playdates/${crudPlaydateId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(crudPlaydateId);
  });

  test("Get Playdate by ID - Invalid ID format", async () => {
    const res = await request(app).get(`/api/playdates/invalidID`);
    expect(res.statusCode).toBe(400);
  });

  test("Get Playdate by ID - Non-existing", async () => {
    const res = await request(app).get(
      `/api/playdates/${new mongoose.Types.ObjectId()}`
    );
    expect(res.statusCode).toBe(404);
  });

  test("Update Playdate - Success by owner", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${crudPlaydateId}`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ location: "Updated Park" });
    expect(res.statusCode).toBe(200);
  });

  test("Update Playdate - Fail by other user", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${crudPlaydateId}`)
      .set("Authorization", `Bearer ${tokens.user2}`)
      .send({ location: "Hack Attempt" });
    expect(res.statusCode).toBe(401);
  });

  test("Update Playdate - Fail no token", async () => {
    const res = await request(app)
      .patch(`/api/playdates/${crudPlaydateId}`)
      .send({ location: "Fail" });
    expect(res.statusCode).toBe(401);
  });

  test("Delete Playdate - Fail by other user", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${crudPlaydateId}`)
      .set("Authorization", `Bearer ${tokens.user2}`);
    expect(res.statusCode).toBe(401);
  });

  test("Delete Playdate - Success by owner", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${crudPlaydateId}`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(200);
  });

  test("Get All Playdates - after deletions", async () => {
    const res = await request(app).get("/api/playdates");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    expect(res.body.totalItems).toBe(1);
    expect(res.body.currentPage).toBe(1);
  });
});

describe("Playdate Participants Tests", () => {
  test("Add Participant - Success", async () => {
    const res = await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Participation confirmed");
  });

  test("Add Participant - Fail double participation", async () => {
    await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });

    const res = await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("User already participating");
  });

  test("Add Participant - Fail invalid playdate ID", async () => {
    const res = await request(app)
      .post(`/api/playdates/invalidID/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });
    expect(res.statusCode).toBe(400);
  });

  test("Add Participant - Fail non-existing playdate", async () => {
    const res = await request(app)
      .post(`/api/playdates/${new mongoose.Types.ObjectId()}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });
    expect(res.statusCode).toBe(404);
  });

  test("Add Participant - Fail without token", async () => {
    const res = await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .send({ dogIds: [] });
    expect(res.statusCode).toBe(401);
  });

  test("Add Participant - Fail with invalid token", async () => {
    const res = await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer invalidtoken`)
      .send({ dogIds: [] });
    expect(res.statusCode).toBe(401);
  });

  test("Remove Participant - Success", async () => {
    await request(app)
      .post(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`)
      .send({ dogIds: [] });

    const res = await request(app)
      .delete(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Participation removed");
  });

  test("Remove Participant - Fail if not participating", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("User not participating");
  });

  test("Remove Participant - Fail invalid playdate ID", async () => {
    const res = await request(app)
      .delete(`/api/playdates/invalidID/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(400);
  });

  test("Remove Participant - Fail non-existing playdate", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${new mongoose.Types.ObjectId()}/attend`)
      .set("Authorization", `Bearer ${tokens.user1}`);
    expect(res.statusCode).toBe(404);
  });

  test("Remove Participant - Fail without token", async () => {
    const res = await request(app).delete(
      `/api/playdates/${participantPlaydateId}/attend`
    );
    expect(res.statusCode).toBe(401);
  });

  test("Remove Participant - Fail with invalid token", async () => {
    const res = await request(app)
      .delete(`/api/playdates/${participantPlaydateId}/attend`)
      .set("Authorization", `Bearer invalidtoken`);
    expect(res.statusCode).toBe(401);
  });
});
