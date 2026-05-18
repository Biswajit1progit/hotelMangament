
const Hotel = require("../models/hotel");

/* const searchHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, rating } = req.body;

    let query = {};

    if (city) {
      query.city = new RegExp(city, "i");
    }

    if (minPrice && maxPrice) {
      query.pricePerNight = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const hotels = await Hotel.find(query);

    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}; */
/* const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; */

/* const getHotelsByDistrict = async (req, res) => {
  const { district } = req.query;

  const hotels = await Hotel.find({ district });

  res.json(hotels);
}; */



// 📄 GET BY ID
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const searchHotels = async (req, res) => {
  try {
    const { district, minPrice, maxPrice, rating } = req.query;

    let query = {};

    // ✅ SAFE CHECK
    if (district && district !== "null" && district.trim() !== "") {
      query.district = { $regex: district, $options: "i" };
    }

    // ✅ PRICE
    if (minPrice || maxPrice) {
      query.pricePerNight = {};

      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // ✅ RATING
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    /* console.log("QUERY:", query); */ // ✅ DEBUG

    const hotels = await Hotel.find(query);

    res.json(hotels);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// 📍 DISTRICT FILTER
const getHotelsByDistrict = async (req, res) => {
  try {
    const { district } = req.query;

    const hotels = await Hotel.find({
      district: new RegExp(district, "i"),
    });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
};

module.exports = { searchHotels, getHotelById, getHotelsByDistrict};