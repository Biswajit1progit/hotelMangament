 const express = require("express");
const router = express.Router();
/* const { searchHotels , getHotelById } = require("../controllers/hotelController");

router.post("/search", searchHotels);
router.get("/:id", getHotelById); */
const hotelController = require("../controllers/hotelController");
const hotel = require("../models/hotel");

// ✅ USE OBJECT (SAFER)
router.get("/search", hotelController.searchHotels);
router.get("/:id", hotelController.getHotelById);
router.get("/",hotelController.getHotelsByDistrict);
module.exports = router;
