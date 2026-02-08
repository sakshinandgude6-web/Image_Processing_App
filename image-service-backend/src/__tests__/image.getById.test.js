require("dotenv").config({ path: "src/.env" });

const request = require("supertest");
const path = require("path");
const mongoose = require("mongoose");
const app = require("../app");

describe("Get image by id API (real MongoDB + real S3)", () => {
  let token;
  let imageId;

  const userData = {
    username: "getByIdUser_" + Date.now(),
    password: "testPassword",
  };

  beforeAll(async () => {
    // your project connects DB only in server.js
    // so tests must connect manually
    await mongoose.connect(process.env.MONGODB_URI);

    // register
    await request(app).post("/api/auth/register").send(userData);

    // login
    const loginRes = await request(app).post("/api/auth/login").send(userData);

    token = loginRes.body.token;

    // upload image (goes to S3)
    const filePath = path.join(__dirname, "files", "test-image.png");

    const uploadRes = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath);

    imageId = uploadRes.body._id;

    // create one transformed image (so transformedImage exists)
    await request(app)
      .post(`/api/images/${imageId}/transform`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        transformations: {
          resize: { width: 100, height: 100 },
          format: "png",
        },
      });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should return original image and transformed image for logged-in user", async () => {
    const res = await request(app)
      .get(`/api/images/${imageId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("image");
    expect(res.body).toHaveProperty("transformedImage");

    expect(res.body.image).toHaveProperty("_id");
    expect(res.body.image._id).toBe(imageId);

    // transformed image may exist
    if (res.body.transformedImage) {
      expect(res.body.transformedImage).toHaveProperty("_id");
      expect(res.body.transformedImage).toHaveProperty("outputUrl");

      // real S3 URL
      expect(res.body.transformedImage.outputUrl).toContain(
        `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      );
    }
  });

  it("should return 404 for non-existing image id", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/images/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Image not found");
  });
});
