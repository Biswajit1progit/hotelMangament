 /* const express = require("express");
const router = express.Router();
const { register, login, getProfile,toggleWishlist, getWishlist } = require("../controllers/authController"); */
//import { getProfile } from "../controllers/authController.js";
//import { protect } from "../middleware/authMiddleware.js";
/* const {verifyToken }=require("../middleware/authMiddleware");

router.post("/wishlist/:hotelId", verifyToken, toggleWishlist);
router.get("/wishlist", verifyToken, getWishlist);
router.get("/me", verifyToken, getProfile);
router.post("/register", register);
router.post("/login", login);

module.exports = router; */

const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,   // ← NEW
  login,
  googleAuth,    // ← NEW
  getProfile,
  toggleWishlist,
  getWishlist
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ── Existing routes — unchanged ───────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);
router.post("/wishlist/:hotelId", verifyToken, toggleWishlist);
router.get("/wishlist", verifyToken, getWishlist);

// ── New routes ────────────────────────────────────────────────
router.get("/verify/:token", verifyEmail);   // ← email verification link
router.post("/google", googleAuth);          // ← Google OAuth

module.exports = router;