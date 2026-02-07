const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");

router.get("/protected", auth, (req, res) => {
  res.json({
    message: "You have access",
    user: req.user,
  });
});

module.exports = router;
