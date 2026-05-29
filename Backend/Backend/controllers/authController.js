/* const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config(); */

// ✅ REGISTER — supports user, hotelOwner, admin (admin needs secret key)
/* const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    } */

    // ✅ Admin registration requires secret key
/*     if (role === "admin") {
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
 */
// ✅ LOGIN — returns role so frontend can redirect correctly
/* const login = async (req, res) => {
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
}; */

// ✅ WISHLIST TOGGLE
/* const toggleWishlist = async (req, res) => {
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
}; */

// ✅ GET WISHLIST
/* const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

module.exports = { register, login, getProfile, toggleWishlist, getWishlist }; */


const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { sendVerificationEmail, sendWelcomeEmail } = require("../service/emailService");
const { OAuth2Client } = require("google-auth-library");
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ REGISTER — sends verification email, user must verify before login
const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, password are required" });

    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.googleId)
        return res.status(400).json({ message: "This email is registered with Google. Please use Continue with Google." });
      if (!existingUser.isVerified) {
        const token = crypto.randomUUID();
        existingUser.verifyToken = token;
        await existingUser.save();
        try { await sendVerificationEmail({ to: email, userName: existingUser.name, token }); } catch (_) {}
        return res.status(400).json({ message: "Account exists but not verified. We sent a new verification email — check your inbox." });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "admin" && adminSecret !== process.env.ADMIN_SECRET_KEY)
      return res.status(403).json({ message: "Invalid admin secret key" });

    const validRoles = ["user", "hotelOwner", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "user";
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomUUID();

    await User.create({
      name, email,
      password: hashedPassword,
      role: assignedRole,
      isVerified: false,
      verifyToken,
    });

    try { await sendVerificationEmail({ to: email, userName: name, token: verifyToken }); }
    catch (emailErr) { console.warn("Verification email failed:", emailErr.message); }

    res.status(201).json({
      message: "Account created! Please check your email and click the verification link to activate your account.",
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ VERIFY EMAIL — user clicks link in email
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token });
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid-link`);

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    try { await sendWelcomeEmail({ to: user.email, userName: user.name }); } catch (_) {}

    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=verify-failed`);
  }
};

// ✅ LOGIN — blocks unverified users
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password)
      return res.status(400).json({ message: "This account uses Google sign-in. Please use Continue with Google." });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first. Check your inbox for the verification link." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GOOGLE AUTH — new
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name, email, googleId, avatar: picture,
        password: null, role: "user", isVerified: true,
      });
      try { await sendWelcomeEmail({ to: email, userName: name }); } catch (_) {}
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });

  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// ✅ GET PROFILE — unchanged
const getProfile = async (req, res) => {
  try { res.json(req.user); }
  catch (error) { res.status(500).json("Server error"); }
};

// ✅ WISHLIST TOGGLE — unchanged
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

// ✅ GET WISHLIST — unchanged
const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

module.exports = { register, verifyEmail, login, googleAuth, getProfile, toggleWishlist, getWishlist }; 