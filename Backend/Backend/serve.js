const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();


const hotelRoutes = require("./routes/hotelRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const offerRoutes = require("./routes/offerRoutes");   // NEW
const movieRoutes = require("./routes/Movieroutes");
const movieBookingRoutes = require("./routes/movieBookingRoutes");
const { runCheckoutNotifier } = require("./script/checkoutNotifier");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes")
const contactRoutes = require("./routes/contactRoutes")
const app = express();

/* app.set("trust proxy", 1) 
const allowedOrigins = [
  "http://localhost:1234",
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
})); */
const allowedOrigins = [
  "http://localhost:1234",
     // add any other local ports you use
  process.env.FRONTEND_URL, // e.g. https://safarsetu.netlify.app
];
 
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,   // ← MUST be true for cookies to work cross-origin
}));
 
// ── Also add this AFTER the cors() middleware ─────────────────────────────────
// Explicitly set Vary: Origin so CDNs/proxies don't cache the wrong CORS headers
app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use("/images", express.static("public/images"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/hotels", hotelRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAnalyticsRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/offers", offerRoutes);   // NEW
app.use("/api/movies", movieRoutes);
app.use("/api/movie-bookings", movieBookingRoutes);
app.get("/", (req, res) => {
  res.send("API Working ✅");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});

runCheckoutNotifier();


const { releaseExpiredReservations } = require("./controllers/movieBookingController");
setInterval(() => releaseExpiredReservations().catch(console.error), 60 * 1000); // every 60 second