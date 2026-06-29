const Review = require("../models/Revie");
const Hotel  = require("../models/hotel");

// ── Helper: recalculate hotel rating after any review change ─────────────────
const recalculateRating = async (hotelId) => {
  const allReviews    = await Review.find({ hotelId });
  const totalReviews  = allReviews.length;
  const averageRating = totalReviews > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  await Hotel.findByIdAndUpdate(hotelId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews,
  });
};


// ── GET reviews by hotel ──────────────────────────────────────────────────────
// CHANGED: route now has verifyToken so req.user exists here.
// populate("userId", "name") stays — shows reviewer name from DB, not from
// body (which could be spoofed). Safe because it reads from the User document
// linked by userId ObjectId.
const getReviewsByHotel = async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId })
      .populate("userId", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};


// ── POST add review ───────────────────────────────────────────────────────────
// Already correct: reads userId from req.user.id (JWT), not req.body ✅
// CHANGED: also read name/email from req.user so they can never be spoofed,
// even if someone sends name/email fields in the body they are ignored.
const addReview = async (req, res) => {
  try {
    const { hotelId, text, rating } = req.body;
    const userId = req.user.id;   // ✅ from JWT — cannot be faked

    // Prevent duplicate reviews
    const existing = await Review.findOne({ hotelId, userId });
    if (existing)
      return res.status(400).json({ error: "You already reviewed this hotel" });

    const review = new Review({
      hotelId,
      userId,               // ✅ from JWT
      text,
      rating: Number(rating),
    });

    await review.save();
    await recalculateRating(hotelId);

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Review failed" });
  }
};


// ── PUT edit review ───────────────────────────────────────────────────────────
// Already correct: ownership enforced in findOneAndUpdate query ✅
// CHANGED: only allow text/rating to be updated — hotelId/userId cannot be
// changed even if sent in body (they are not passed to the update object).
const editReview = async (req, res) => {
  try {
    const { text, rating } = req.body;  // hotelId/userId deliberately excluded

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },  // ownership in query ✅
      { text, rating: Number(rating) },
      { new: true }
    );

    if (!review)
      return res.status(404).json({ error: "Review not found" });

    await recalculateRating(review.hotelId);
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit review" });
  }
};


// ── DELETE review ─────────────────────────────────────────────────────────────
// NEW: was missing — without this a user can never remove their review.
// Ownership enforced same way as editReview.
// Also recalculates hotel rating after deletion.
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,   // only the author can delete ✅
    });

    if (!review)
      return res.status(404).json({ error: "Review not found" });

    await recalculateRating(review.hotelId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};


module.exports = { getReviewsByHotel, addReview, editReview, deleteReview };