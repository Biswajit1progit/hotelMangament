
/* const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");
 */
// ✅ Upload multiple images (max 5) → saves to Cloudinary
/* router.post("/images", verifyToken, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    } */

    // ✅ Cloudinary returns full https:// URL in file.path
   /*  const imagePaths = req.files.map((file) => file.path);

    res.json({
      message: "Images uploaded successfully",
      images: imagePaths, // full Cloudinary URLs
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; */
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/images", verifyToken, (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error:", err); // ← logs exact error
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const imagePaths = req.files.map((file) => file.path);
    console.log("Uploaded images:", imagePaths); // ← logs success

    res.json({
      message: "Images uploaded successfully",
      images: imagePaths,
    });

  } catch (err) {
    console.error("Upload route error:", err); // ← logs exact error
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;