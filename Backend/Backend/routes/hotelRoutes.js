const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// ✅ FIXED — route order bug. Previously:
//   router.get("/search", ...) was BELOW router.get("/:id", ...)
//   so GET /search was matched as /:id with id="search",
//   hitting getHotelById("search") instead of searchHotels.
//
// Specific routes must always be declared before parameterised ones.
// Correct order: /search and / before /:id
router.get("/search", hotelController.searchHotels);
router.get("/", hotelController.getHotelsByDistrict);

// /:id must come last — catches everything not matched above
router.get("/:id", hotelController.getHotelById);

module.exports = router;