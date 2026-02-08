require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const app = require("../app");

describe("List images API", () => {
  let token;

  const userData = {
    username: "listUser_" + Date.now(),
    password: "testPassword",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    await request(app).post("/api/auth/register").send(userData);

    const loginRes = await request(app).post("/api/auth/login").send(userData);
    token = loginRes.body.token;

    const filePath = path.join(__dirname, "files", "test-image.png");

    await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);

    await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return paginated list of images for logged-in user", async () => {
    const res = await request(app)
      .get("/api/images?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("limit");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("results");

    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);

    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThanOrEqual(2);
  });

  it("should return empty array when requesting a page with no results", async () => {
    const res = await request(app)
      .get("/api/images?page=100&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBe(0);
  });
});
