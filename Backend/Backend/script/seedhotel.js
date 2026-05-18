const mongoose = require("mongoose");
const Hotel = require("../models/hotel");
const rawData = require("./data.json"); // adjust path if needed
const dotenv = require("dotenv");
dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    await Hotel.deleteMany();

    let hotels = [];

    // ✅ FIXED LOOP
    rawData.states.forEach((stateObj) => {
      const state = stateObj.name;

      stateObj.districts.forEach((districtObj) => {
        const district = districtObj.name;

        districtObj.hotels.forEach((hotel) => {
          hotels.push({
            name: hotel.name,
            address: hotel.address,
            state,
            district,

            pricePerNight: hotel.price_per_night,
            rooms: hotel.rooms,
            amenities: hotel.amenities,
            contact: hotel.contact,
            type: hotel.type,

            location: {
              lat: hotel.lat,
              lng: hotel.lng,
            },

            images: [hotel.image],

            // ✅ initial review data
            averageRating: hotel.rating || 0,
            totalReviews: 1,
          });
        });
      });
    });

    await Hotel.insertMany(hotels);

    console.log("✅ Hotels Seeded Successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedData();

 