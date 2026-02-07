require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const app = require("../app");

describe("Image transform API", () => {
  let token;
  let imageId;

  const userData = {
    username: "transformUser_" + Date.now(),
    password: "testPassword",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // register
    await request(app).post("/api/auth/register").send(userData);

    // login
    const loginRes = await request(app).post("/api/auth/login").send(userData);

    token = loginRes.body.token;

    // upload one image
    const filePath = path.join(__dirname, "files", "test-image.png");

    const uploadRes = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);

    imageId = uploadRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should transform an image and create a new transformed record", async () => {
    const res = await request(app)
      .post(`/api/images/${imageId}/transform`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transformations: {
          resize: { width: 200, height: 200 },
          filters: { grayscale: true },
          format: "png",
        },
      });

    expect(res.statusCode).toBe(201);

    expect(res.body.cached).toBe(false);
    expect(res.body.result).toHaveProperty("_id");
    expect(res.body.result).toHaveProperty("outputUrl");
    expect(res.body.result).toHaveProperty("width");
    expect(res.body.result).toHaveProperty("height");
    expect(res.body.result.format).toBe("png");
  });

  it("should return cached transformed image when same transformation is requested again", async () => {
    const res = await request(app)
      .post(`/api/images/${imageId}/transform`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transformations: {
          resize: { width: 200, height: 200 },
          filters: { grayscale: true },
          format: "png",
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.cached).toBe(true);
    expect(res.body.result).toHaveProperty("_id");
  });
});
