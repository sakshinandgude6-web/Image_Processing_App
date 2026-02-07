const mongoose = require("mongoose");

const transformedImageSchema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transformations: {
      type: Object,
      required: true,
    },

    hash: {
      type: String,
      required: true,
      index: true,
    },

    outputUrl: {
      type: String,
      required: true,
    },

    format: String,
    width: Number,
    height: Number,
    size: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("TransformedImage", transformedImageSchema);
