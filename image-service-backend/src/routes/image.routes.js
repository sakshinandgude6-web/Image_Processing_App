const router = require("express").Router();
const multer = require("multer");

const auth = require("../middlewares/auth.middleware");
const imageController = require("../controllers/image.controller");

const upload = multer({
  dest: "uploads/",
});

router.post("/", auth, upload.single("image"), imageController.uploadImage);
router.post("/:id/transform", auth, imageController.transformImage);

module.exports = router;
