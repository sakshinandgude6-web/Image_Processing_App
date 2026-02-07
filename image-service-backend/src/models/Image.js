const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalUrl: {
      type: String,
      required: true,
    },

    originalKey: {
      type: String,
      required: true,
    },

    width: Number,
    height: Number,
    format: String,
    size: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Image", imageSchema);
