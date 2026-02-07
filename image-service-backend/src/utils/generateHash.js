const crypto = require("crypto");

module.exports = (imageId, transformations) => {
  const data = imageId + JSON.stringify(transformations);
  return crypto.createHash("sha256").update(data).digest("hex");
};
