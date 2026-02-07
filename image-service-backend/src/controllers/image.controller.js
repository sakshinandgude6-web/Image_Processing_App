const sharp = require("sharp");
const Image = require("../models/Image");
const path = require("path");
const fs = require("fs");
const TransformedImage = require("../models/TransformedImage");
const generateHash = require("../utils/generateHash");

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const metadata = await sharp(file.path).metadata();

    const image = await Image.create({
      owner: req.user.userId,
      originalUrl: `/uploads/${file.filename}`,
      originalKey: file.filename,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: file.size,
    });

    res.status(201).json(image);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

exports.transformImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const transformations = req.body.transformations;

    if (!transformations) {
      return res.status(400).json({ message: "Transformations required" });
    }

    const image = await Image.findOne({
      _id: imageId,
      owner: req.user.userId,
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const hash = generateHash(imageId, transformations);

    const cached = await TransformedImage.findOne({
      hash,
      owner: req.user.userId,
    });

    if (cached) {
      return res.json({
        cached: true,
        result: cached,
      });
    }

    const inputPath = path.join(__dirname, "../../uploads", image.originalKey);

    let pipeline = sharp(inputPath);

    if (transformations.resize) {
      const { width, height } = transformations.resize;
      pipeline = pipeline.resize(width, height);
    }

    if (transformations.rotate) {
      pipeline = pipeline.rotate(transformations.rotate);
    }

    if (transformations.filters?.grayscale) {
      pipeline = pipeline.grayscale();
    }

    let outputFormat = image.format;

    if (transformations.format) {
      outputFormat = transformations.format;
      pipeline = pipeline.toFormat(outputFormat);
    }

    const outputFileName = `${imageId}-${Date.now()}.${outputFormat}`;

    const outputPath = path.join(__dirname, "../../uploads", outputFileName);

    const info = await pipeline.toFile(outputPath);

    const transformed = await TransformedImage.create({
      imageId: image._id,
      owner: req.user.userId,
      transformations,
      hash,
      outputUrl: `/uploads/${outputFileName}`,
      format: outputFormat,
      width: info.width,
      height: info.height,
      size: info.size,
    });

    res.status(201).json({
      cached: false,
      result: transformed,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: "Transformation failed" });
  }
};
