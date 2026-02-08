require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const path = require("path");
const mongoose = require("mongoose");
const app = require("../app");

describe("Transform image API (real S3 + real MongoDB)", () => {
  let token;
  let imageId;

  const userData = {
    username: "transformUser_" + Date.now(),
    password: "testPassword",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    await request(app).post("/api/auth/register").send(userData);

    const loginRes = await request(app).post("/api/auth/login").send(userData);

    token = loginRes.body.token;

    const filePath = path.join(__dirname, "files", "test-image.png");

    const uploadRes = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);

    imageId = uploadRes.body._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should transform image and upload transformed version to S3", async () => {
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

    expect(res.body).toHaveProperty("cached", false);
    expect(res.body).toHaveProperty("result");

    const result = res.body.result;

    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("outputUrl");
    expect(result).toHaveProperty("width");
    expect(result).toHaveProperty("height");
    expect(result).toHaveProperty("format");

    expect(result.format).toBe("png");

    expect(result.outputUrl).toContain(
      `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
    );
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

    expect(res.body).toHaveProperty("cached", true);
    expect(res.body).toHaveProperty("result");
    expect(res.body.result).toHaveProperty("_id");
  });

  it("should fail if transformations are missing", async () => {
    const res = await request(app)
      .post(`/api/images/${imageId}/transform`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Transformations required");
  });

  it("should return 404 if image does not belong to user or does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/images/${fakeId}/transform`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transformations: {
          resize: { width: 100, height: 100 },
        },
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Image not found");
  });
});
