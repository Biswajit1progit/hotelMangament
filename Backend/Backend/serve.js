
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
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
const uploadRoutes = require("./routes/uploadRoutes");
const { runCheckoutNotifier } = require("./script/checkoutNotifier");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes

app.use("/api/hotels", hotelRoutes);

app.use("/api/reviews", reviewRoutes);




app.use("/api/auth", authRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("API Working ✅");
});

// Server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});

runCheckoutNotifier();