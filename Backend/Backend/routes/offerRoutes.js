const express = require("express");
const router = express.Router();

const {
  createOffer,
  updateOffer,
  deleteOffer,
  getAllOffers,
  getOwnerOffers,
  getOffersForHotel,
  validateOffer,
} = require("../controllers/offerController");

const { verifyToken, verifyAdmin, verifyOwner } = require("../middleware/authMiddleware");

// --- Specific routes BEFORE any /:id style routes ---

// Public: get active offers for a hotel (shown on hotel detail page)
router.get("/hotel/:hotelId", getOffersForHotel);

// Logged-in users: validate a code at checkout
router.post("/validate", verifyToken, validateOffer);

// Admin: view all offers
router.get("/admin/all", verifyToken, verifyAdmin, getAllOffers);

// Owner: view offers for hotels they own
router.get("/owner/mine", verifyToken, verifyOwner, getOwnerOffers);

// Create: admin or owner (role check happens inside controller)
router.post("/", verifyToken, createOffer);

// Update / Delete by id: admin or owning owner (role check happens inside controller)
router.put("/:id", verifyToken, updateOffer);
router.delete("/:id", verifyToken, deleteOffer);

module.exports = router;