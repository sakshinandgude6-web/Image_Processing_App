require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Auth Middleware", () => {
  let token;

  const userData = {
    username: "jwt_test_" + Date.now(),
    password: "testPassword",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/login").send(userData);

    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should allow access when request is valid", async () => {
    const res = await request(app)
      .get("/api/test/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("You have access");
    expect(res.body.user.username).toBe(userData.username);
  });

  it("should block request when Authorization header is missing", async () => {
    const res = await request(app).get("/api/test/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authorization header missing");
  });

  it("should block request when token is invalid", async () => {
    const res = await request(app)
      .get("/api/test/protected")
      .set("Authorization", "Bearer wrongtoken");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });
});
