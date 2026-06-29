const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getReviewsByHotel, addReview, editReview, deleteReview } = require("../controllers/reviewController");

// GET — protected: only logged-in users can read reviews
router.get("/:hotelId",  verifyToken, getReviewsByHotel);

// POST — add review (verifyToken ensures userId comes from JWT, not body)
router.post("/",         verifyToken, addReview);

// PUT — edit review (ownership enforced in controller query)
router.put("/:id",       verifyToken, editReview);

// DELETE — remove review (ownership enforced in controller query)
router.delete("/:id",    verifyToken, deleteReview);

module.exports = router;