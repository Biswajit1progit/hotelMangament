 const Review = require("../models/Revie");
 const Hotel = require("../models/hotel"); 

// 📥 Get reviews by hotel ID
const getReviewsByHotel = async (req, res) => {
 /*  try {
    const reviews = await Review.find({
      hotelId: req.params.hotelId,
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } */
  try {
    const reviews = await Review.find({
       hotelId: req.params.hotelId }).populate("userId", "name"); // ✅ important
     res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// ✍️ Add review
const addReview = async (req, res) => {
 /*  try {
    const review = new Review(req.body);
    await review.save();

    res.json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } */

     try {
     
    const { hotelId, text, rating  } = req.body;
          // ❌ Check if already reviewed
           const userId=req.user.id;  // ✅ KEY FIX
    const existing = await Review.findOne({ hotelId, userId });

    if (existing) {
      return res.status(400).json("You already reviewed this hotel");
    }

    // 🔍 DEBUG (IMPORTANT)
    

   const review = new Review({
      hotelId,
      userId: req.user.id,   // ✅ KEY FIX
      text,
      rating: Number(rating),
});

    await review.save();
   

    // ✅ Recalculate averageRating and totalReviews
const allReviews = await Review.find({ hotelId });
const totalReviews = allReviews.length;
const averageRating =
  allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

await Hotel.findByIdAndUpdate(hotelId, {
  averageRating: parseFloat(averageRating.toFixed(1)),
  totalReviews,
});
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Review failed" });
  }
};
const editReview = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { text, rating: Number(rating) },
      { new: true }
    );
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit review" });
  }
};
module.exports = { getReviewsByHotel, addReview, editReview };