/*  const jwt = require("jsonwebtoken");
const SECRET_KEY="mysupersecret123";
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
 
  if (!token) return res.status(401).json("Access denied");

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch {
    res.status(400).json("Invalid token");
  }
};
module.exports={verifyToken}; */
const jwt = require("jsonwebtoken");
const User=require("../models/User");


const dotenv = require("dotenv");
dotenv.config();
/* const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;



  if (!authHeader) {
    return res.status(401).json("Access denied");
  }

  // ✅ Extract actual token
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token,"mysupersecret123");  // ✅ FIXED

    req.user = decoded;
    next();

  } catch (err) {
     // 🔥 DEBUG
    return res.status(400).json("Invalid token");
  }
}; */

/* export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token,"mysupersecret123");

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401).json("Not authorized");
    }
  }

  if (!token) {
    res.status(401).json("No token");
  }
};

module.exports = { verifyToken, protect }; */
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


// ✅ Only hotel owners
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
 
// ✅ Only admins
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
module.exports = { verifyToken, verifyOwner, verifyAdmin }