const router = require("express").Router();
const multer = require("multer");

const auth = require("../middlewares/auth.middleware");
const imageController = require("../controllers/image.controller");
const transformRateLimit = require("../middlewares/transformRateLimit");

const upload = multer({
  dest: "uploads/",
});

router.post("/", auth, upload.single("image"), imageController.uploadImage);
router.post(
  "/:id/transform",
  auth,
  transformRateLimit,
  imageController.transformImage,
);
router.get("/", auth, imageController.listImages);
router.get("/:id", auth, imageController.getImageById);

module.exports = router;
