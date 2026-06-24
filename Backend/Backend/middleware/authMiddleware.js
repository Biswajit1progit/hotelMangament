const jwt = require("jsonwebtoken");
const User = require("../models/User");

const dotenv = require("dotenv");
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    console.error("VERIFY TOKEN ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

const verifyOwner = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) return res.status(401).json({ message: "User not found" });
    if (req.user?.role !== "hotelOwner") {
      return res.status(403).json({ message: "Access denied. Owner only." });
    }
    next();
  } catch (err) {
    console.error("VERIFY OWNER ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) return res.status(401).json({ message: "User not found" });
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (err) {
    console.error("VERIFY ADMIN ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken, verifyOwner, verifyAdmin };