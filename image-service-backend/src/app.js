require("dotenv").config({ path: "./src/.env" });

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const imageRoutes = require("./routes/image.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/images", imageRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Image service backend running");
});

module.exports = app;
