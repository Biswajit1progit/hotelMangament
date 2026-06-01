 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Hotels from "./pages/hotel";
import HotelDetails from "./pages/hoteldetail";   // 👈 IMPORTANT
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails"
import Wishlist from "./pages/Wishlist";
import SuccessPage from "./pages/SuccessPage"; // ✅ NEW
import PaymentPage  from "./pages/PaymentPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatBot from "./component/ChatBot";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerRequests from "./pages/owner/OwnerRequests";
import OwnerBookings from "./pages/owner/OwnerBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HotelDetail from "./pages/admin/HotelDetail"
import ContactPage from "./pages/ContactPage"
import UnderMaintenance from "./pages/UnderMaintenance";
function App() {
  return (
    <BrowserRouter>
     <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
       { /* 👇 Hotel Detail Page (Dynamic ID) */}
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* Booking */}
        <Route path="/booking/:id" element={<Booking />} />
        {/* Login */}
        <Route path="/login" element={<Login />} />
        {/* Register */}
        <Route path="/register" element={<Register />} />
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/success/:id" element={<SuccessPage />} />
        {/* paymentpage details */}
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/requests" element={<OwnerRequests />} />
       <Route path="/owner/bookings" element={<OwnerBookings />} />
       <Route path="/admin/dashboard" element={<AdminDashboard />} />
       <Route path="/admin/hotel-analytics/:id" element={<HotelDetail />} />
       <Route path="/contact" element={<ContactPage />} />
       <Route path="/movies" element={<UnderMaintenance />} />
       <Route path="/flights" element={<UnderMaintenance />} />
       <Route path="/events" element={<UnderMaintenance />} />
      </Routes>
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;