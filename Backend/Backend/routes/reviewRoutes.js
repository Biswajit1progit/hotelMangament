 const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const { getReviewsByHotel, addReview,editReview} = require("../controllers/reviewController");

// 📥 Get reviews for a hotel
router.get("/:hotelId", getReviewsByHotel);

// ✍️  Verify Token and Add review
  //router.post("/", addReview);

//
router.post("/", verifyToken, addReview);

// add this one line below existing routes
router.put("/:id", verifyToken, editReview); // ✅ edit route

module.exports = router;