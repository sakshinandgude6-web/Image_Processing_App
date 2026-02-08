const request = require("supertest");
const express = require("express");

const transformRateLimit = require("../middlewares/transformRateLimit");

describe("transformRateLimit middleware", () => {
  let app;

  beforeEach(() => {
    app = express();

    app.post("/transform", transformRateLimit, (req, res) => {
      res.status(200).json({ ok: true });
    });
  });

  it("should block requests after exceeding the limit", async () => {
    let lastResponse;

    for (let i = 0; i < 11; i++) {
      lastResponse = await request(app).post("/transform");
    }

    expect(lastResponse.statusCode).toBe(429);
    expect(lastResponse.body).toEqual({
      message: "Too many image transformations. Please try again later.",
    });
  });
});
