const Theater = require("../models/Theater");

// ── Admin: create a theater ──────────────────────────────────────────────
exports.createTheater = async (req, res) => {
  try {
    const { name, city, address, screens } = req.body;
    if (!name || !city) {
      return res.status(400).json({ message: "name and city are required" });
    }

    const theater = await Theater.create({
      name,
      city,
      address,
      screens: screens || 1,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Theater created", theater });
  } catch (err) {
    console.error("createTheater error:", err);
    res.status(500).json({ message: err.message || "Failed to create theater" });
  }
};

// ── Public: list theaters (optionally filter by city) ───────────────────
exports.getTheaters = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city: new RegExp(city, "i") } : {};
    const theaters = await Theater.find(filter).sort({ name: 1 });
    res.json({ theaters });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch theaters" });
  }
};

// ── Admin: update a theater ──────────────────────────────────────────────
exports.updateTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, address, screens } = req.body;

    const theater = await Theater.findById(id);
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    if (name !== undefined) theater.name = name;
    if (city !== undefined) theater.city = city;
    if (address !== undefined) theater.address = address;
    if (screens !== undefined) theater.screens = screens;

    await theater.save();
    res.json({ message: "Theater updated", theater });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update theater" });
  }
};

// ── Admin: delete a theater ───────────────────────────────────────────────
exports.deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    await Theater.findByIdAndDelete(id);
    res.json({ message: "Theater deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete theater" });
  }
};