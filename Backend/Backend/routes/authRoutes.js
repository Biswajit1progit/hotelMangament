 const express = require("express");
const router = express.Router();
const { register, login, getProfile,toggleWishlist, getWishlist } = require("../controllers/authController");
//import { getProfile } from "../controllers/authController.js";
//import { protect } from "../middleware/authMiddleware.js";
const {verifyToken }=require("../middleware/authMiddleware");

router.post("/wishlist/:hotelId", verifyToken, toggleWishlist);
router.get("/wishlist", verifyToken, getWishlist);
router.get("/me", verifyToken, getProfile);
router.post("/register", register);
router.post("/login", login);

module.exports = router;