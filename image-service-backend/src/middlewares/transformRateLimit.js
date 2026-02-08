const rateLimit = require("express-rate-limit");

const transformRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    message: "Too many image transformations. Please try again later.",
  },
});

module.exports = transformRateLimit;
