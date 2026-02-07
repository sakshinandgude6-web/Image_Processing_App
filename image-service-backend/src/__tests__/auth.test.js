require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Routes", () => {
  const userData = {
    username: "testUser_" + Date.now(),
    password: "testPassword",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(userData.username);
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/auth/login").send(userData);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
