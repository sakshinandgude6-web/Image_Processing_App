require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const app = require("../app");

describe("Image upload API", () => {
  let token;

  const userData = {
    username: "imgUser_" + Date.now(),
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

  it("should upload an image successfully", async () => {
    const filePath = path.join(__dirname, "files", "test-image.png");

    const res = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);

    expect(res.statusCode).toBe(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("originalUrl");
    expect(res.body).toHaveProperty("width");
    expect(res.body).toHaveProperty("height");
    expect(res.body).toHaveProperty("format");
    expect(res.body).toHaveProperty("size");
  });

  it("should fail if image is missing", async () => {
    const res = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Image file is required");
  });

  it("should fail if token is missing", async () => {
    const filePath = path.join(__dirname, "files", "test-image.png");

    const res = await request(app).post("/api/images");

    expect(res.statusCode).toBe(401);
  });
});
