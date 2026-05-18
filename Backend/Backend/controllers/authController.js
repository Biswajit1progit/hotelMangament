const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// ✅ REGISTER — supports user, hotelOwner, admin (admin needs secret key)
const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Admin registration requires secret key
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: "Invalid admin secret key" });
      }
    }

    const validRoles = ["user", "hotelOwner", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    res.status(201).json({
      message: "User registered",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ LOGIN — returns role so frontend can redirect correctly
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ frontend uses this to redirect
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json("Server error");
  }
};

// ✅ WISHLIST TOGGLE
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.wishlist) user.wishlist = [];

    const hotelId = req.params.hotelId;
    const exists = user.wishlist.some((id) => id.toString() === hotelId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== hotelId);
    } else {
      user.wishlist.push(hotelId);
    }

    await user.save();
    res.json(user.wishlist);

  } catch (err) {
    console.log("Wishlist Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET WISHLIST
const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

module.exports = { register, login, getProfile, toggleWishlist, getWishlist };