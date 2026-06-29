const User          = require("../models/User");
const RefreshToken  = require("../models/Refreshtoken");
const bcrypt        = require("bcryptjs");
const jwt           = require("jsonwebtoken");
const crypto        = require("crypto");
const dotenv        = require("dotenv");
const { sendVerificationEmail, sendWelcomeEmail } = require("../service/emailService");
const { OAuth2Client }        = require("google-auth-library");
const { REFRESH_COOKIE_OPTIONS } = require("../middleware/authMiddleware");
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Token helpers ─────────────────────────────────────────────────────────────
// Access token: short-lived (15m), carries id+role+name+email in payload
// Refresh token: long-lived (7d), opaque random string stored in DB
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

// Save refresh token to DB with family for reuse detection
const saveRefreshToken = async (token, userId, family) => {
  await RefreshToken.create({
    token,
    userId,
    family,
    used:      false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};

// Issues both tokens and sets the httpOnly cookie
const issueTokens = async (res, user, family = null) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenFamily  = family || crypto.randomUUID();
  await saveRefreshToken(refreshToken, user._id, tokenFamily);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};


// ════════════════════════════════════════════════════════════════════════════
// UNCHANGED from your original — register, verifyEmail, getProfile,
// toggleWishlist, getWishlist all stay exactly the same.
// ════════════════════════════════════════════════════════════════════════════

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

    const validRoles     = ["user", "hotelOwner", "admin"];
    const assignedRole   = validRoles.includes(role) ? role : "user";
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken    = crypto.randomUUID();
    const needsVerification = assignedRole === "user";

    await User.create({
      name, email,
      password: hashedPassword,
      role: assignedRole,
      isVerified:  !needsVerification,
      verifyToken: needsVerification ? verifyToken : null,
    });

    if (needsVerification) {
      try { await sendVerificationEmail({ to: email, userName: name, token: verifyToken }); }
      catch (emailErr) { console.warn("Verification email failed:", emailErr.message); }
    }

    res.status(201).json({
      message: needsVerification
        ? "Account created! Please check your email to verify your account."
        : "Account created successfully! You can now login.",
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token });
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid-link`);
    user.isVerified  = true;
    user.verifyToken = null;
    await user.save();
    try { await sendWelcomeEmail({ to: user.email, userName: user.name }); } catch (_) {}
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=verify-failed`);
  }
};


// ════════════════════════════════════════════════════════════════════════════
// CHANGED: login — now issues access token (15m) + refresh token cookie (7d)
// Response shape stays the same: { token, user }
// so your existing Login.jsx doesn't need to change at all.
// The only new thing is the httpOnly cookie being set silently.
// ════════════════════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password)
      return res.status(400).json({ message: "This account uses Google sign-in. Please use Continue with Google." });

    if (user.role === "user" && !user.isVerified)
      return res.status(401).json({ message: "Please verify your email first. Check your inbox for the verification link." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // CHANGED: short-lived access token (15m) instead of 1d
    // + refresh token set as httpOnly cookie automatically
    const accessToken = await issueTokens(res, user);

    res.json({
      token: accessToken,   // kept as "token" so Login.jsx needs zero changes
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════════════════════
// CHANGED: googleAuth — same pattern, issues refresh cookie alongside token
// ════════════════════════════════════════════════════════════════════════════
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
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
      user.googleId   = googleId;
      user.avatar     = picture;
      user.isVerified = true;
      await user.save();
    }

    // CHANGED: short-lived access token + refresh cookie
    const accessToken = await issueTokens(res, user);

    res.json({
      token: accessToken,   // kept as "token" for frontend compatibility
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};


// ════════════════════════════════════════════════════════════════════════════
// NEW: refresh — called by frontend interceptor when access token expires.
// Reads refresh token from httpOnly cookie, rotates it, issues new access token.
// ════════════════════════════════════════════════════════════════════════════
const refresh = async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken;
    if (!incoming)
      return res.status(401).json({ message: "No refresh token", code: "NO_REFRESH_TOKEN" });

    const stored = await RefreshToken.findOne({ token: incoming });
    if (!stored)
      return res.status(401).json({ message: "Invalid refresh token", code: "INVALID_REFRESH" });

    // Reuse detection — if token already rotated, kill entire family
    if (stored.used) {
      console.warn(`⚠️  Token reuse detected — family: ${stored.family}`);
      await RefreshToken.deleteMany({ family: stored.family });
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(401).json({ message: "Token reuse detected. Please login again.", code: "TOKEN_REUSE" });
    }

    // Mark as used (rotation)
    stored.used = true;
    await stored.save();

    const user = await User.findById(stored.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "User not found", code: "USER_NOT_FOUND" });

    // Issue new access token + new refresh cookie (same family)
    const accessToken = await issueTokens(res, user, stored.family);

    res.json({
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ════════════════════════════════════════════════════════════════════════════
// NEW: logout — kills refresh token in DB and clears the cookie.
// ════════════════════════════════════════════════════════════════════════════
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const stored = await RefreshToken.findOne({ token });
      if (stored) await RefreshToken.deleteMany({ family: stored.family });
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ════════════════════════════════════════════════════════════════════════════
// UNCHANGED — getProfile, toggleWishlist, getWishlist
// Note: getProfile now reads from JWT (no DB hit) since verifyToken
// sets req.user from the decoded token. If you need fresh DB data,
// use /api/auth/me which does a full User.findById.
// ════════════════════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try { res.json(req.user); }
  catch (error) { res.status(500).json("Server error"); }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.wishlist) user.wishlist = [];
    const hotelId = req.params.hotelId;
    const exists  = user.wishlist.some((id) => id.toString() === hotelId);
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

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist);
};

module.exports = {
  register, verifyEmail, login, googleAuth,
  refresh, logout,                            // ← 2 new exports
  getProfile, toggleWishlist, getWishlist,
};