const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  googleAuth,
  getProfile,
  toggleWishlist,
  getWishlist
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);
router.post("/wishlist/:hotelId", verifyToken, toggleWishlist);
router.get("/wishlist", verifyToken, getWishlist);

router.get("/verify/:token", verifyEmail);
router.post("/google", googleAuth);

module.exports = router;