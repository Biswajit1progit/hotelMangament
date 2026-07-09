import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { initAuth } from "./utils/auth";

import Home            from "./pages/Home";
import Hotels          from "./pages/hotel";
import HotelDetails    from "./pages/hoteldetail";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Profile         from "./pages/Profile";
import Wishlist        from "./pages/Wishlist";
import SuccessPage     from "./pages/SuccessPage";
import PaymentPage     from "./pages/PaymentPage";
import OwnerDashboard  from "./pages/owner/OwnerDashboard";
import OwnerRequests   from "./pages/owner/OwnerRequests";
import OwnerBookings   from "./pages/owner/OwnerBookings";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import HotelDetail     from "./pages/admin/HotelDetail";
import ContactPage     from "./pages/ContactPage";
import OwnerOffers     from "./pages/owner/OwnerOffers"
import UnderMaintenance from "./pages/UnderMaintenance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [authReady, setAuthReady] = useState(false);

  // ── Restore session from httpOnly refresh cookie on every page load ─────
  // If the user has a valid refresh cookie from a previous session,
  // initAuth() silently gets a new access token so they stay logged in
  // across page refreshes — without storing anything in localStorage.
  useEffect(() => {
    initAuth()
      .then((user) => {
        // Notify Navbar/Hotelnav to re-read user from sessionStorage
        if (user) window.dispatchEvent(new Event("storage"));
      })
      .finally(() => setAuthReady(true));
  }, []);

  // Show a minimal spinner while auth is being checked.
  // Prevents protected pages from flashing "not logged in" for ~200ms.
  if (!authReady) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", background: "#f8fafc"
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/"                          element={<Home />} />
        <Route path="/hotels"                    element={<Hotels />} />
        <Route path="/hotel/:id"                 element={<HotelDetails />} />
        <Route path="/login"                     element={<Login />} />
        <Route path="/register"                  element={<Register />} />
        <Route path="/profile"                   element={<Profile />} />
        <Route path="/success/:id"               element={<SuccessPage />} />
        <Route path="/payment/:id"               element={<PaymentPage />} />
        <Route path="/wishlist"                  element={<Wishlist />} />
        <Route path="/owner/dashboard"           element={<OwnerDashboard />} />
        <Route path="/owner/requests"            element={<OwnerRequests />} />
        <Route path="/owner/offers" element={<OwnerOffers />} />
        <Route path="/owner/bookings"            element={<OwnerBookings />} />
        <Route path="/admin/dashboard"           element={<AdminDashboard />} />
        <Route path="/admin/hotel-analytics/:id" element={<HotelDetail />} />
        <Route path="/contact"                   element={<ContactPage />} />
        <Route path="/movies"                    element={<UnderMaintenance />} />
        <Route path="/flights"                   element={<UnderMaintenance />} />
        <Route path="/events"                    element={<UnderMaintenance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;