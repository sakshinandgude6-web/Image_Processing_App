const sharp = require("sharp");
const Image = require("../models/Image");
const fs = require("fs");
const TransformedImage = require("../models/TransformedImage");
const generateHash = require("../utils/generateHash");
const { getFromS3, uploadToS3 } = require("../services/storage.service");

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const metadata = await sharp(file.path).metadata();

    const fileBuffer = fs.readFileSync(file.path);

    const key = `${req.user.userId}/original/${file.filename}`;

    const s3Url = await uploadToS3(fileBuffer, key, file.mimetype);

    const image = await Image.create({
      owner: req.user.userId,
      originalUrl: s3Url,
      originalKey: key,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: file.size,
    });

    res.status(201).json(image);

    fs.unlinkSync(file.path);
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

    const originalBuffer = await getFromS3(image.originalKey);

    let pipeline = sharp(originalBuffer);

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

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    const outputKey = `${req.user.userId}/transformed/${imageId}-${Date.now()}.${outputFormat}`;

    const outputUrl = await uploadToS3(
      data,
      outputKey,
      `image/${outputFormat}`,
    );

    const transformed = await TransformedImage.create({
      imageId: image._id,
      owner: req.user.userId,
      transformations,
      hash,
      outputUrl,
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
    console.error(error);
    res.status(500).json({ message: "Transformation failed" });
  }
};

exports.listImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const images = await Image.find({
      owner: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments({
      owner: req.user.userId,
    });

    res.json({
      page,
      limit,
      total,
      results: images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const imageId = req.params.id;

    const image = await Image.findOne({
      _id: imageId,
      owner: req.user.userId,
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const transformedImage = await TransformedImage.findOne({
      imageId: image._id,
      owner: req.user.userId,
    });

    res.json({
      image,
      transformedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch image" });
  }
};
