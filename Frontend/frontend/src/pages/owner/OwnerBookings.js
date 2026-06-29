// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerBookings.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/apiClient";

const OWNERS = "/api/owners";

// ── Shimmer skeleton ──────────────────────────────────────────
function OwnerBookingsShimmer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="h-8 w-14 sm:w-16 bg-gray-200 rounded-lg" />
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-28 sm:w-36" />
        </div>
        <div className="h-9 sm:h-10 bg-gray-200 rounded-lg w-36 sm:w-56" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-40" />
                    <div className="h-5 bg-gray-200 rounded-full w-16 sm:w-20" />
                  </div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 sm:w-3/5" />
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="h-3 bg-gray-200 rounded w-36 sm:w-44" />
                    <div className="h-3 bg-gray-200 rounded w-36 sm:w-44" />
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0">
                  <div className="h-6 sm:h-7 bg-gray-200 rounded w-20 sm:w-24" />
                  <div className="h-3 bg-gray-200 rounded w-24 sm:w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────
function CancelModal({ booking, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Cancel Booking</h2>
        <p className="text-xs text-gray-400 mb-4 font-mono break-all">ID: {booking._id}</p>

        {/* Booking summary */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600 space-y-1">
          <p><span className="font-semibold text-gray-800">{booking.name}</span> · {booking.email}</p>
          <p>📅 {new Date(booking.checkIn).toLocaleDateString("en-IN")} → {new Date(booking.checkOut).toLocaleDateString("en-IN")}</p>
          <p>🛏️ {booking.rooms} room{booking.rooms > 1 ? "s" : ""} · 💰 ₹{booking.totalPrice?.toLocaleString()}</p>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for cancellation <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Guest requested cancellation, overbooking, maintenance issue..."
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onSubmit(booking._id, reason)}
            disabled={!reason.trim() || submitting}
            className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Cancel Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function OwnerBookings() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [cancelTarget, setCancelTarget] = useState(null); // booking object
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState(null); // { type, msg }
  const navigate                        = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`${OWNERS}/bookings`);
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCancelSubmit = async (bookingId, reason) => {
    setSubmitting(true);
    try {
      await api.post(
        `${OWNERS}/request`,
        {
          type: "cancel_booking",
          bookingId,
          reason,
          details: `Cancel request for booking ${bookingId}`,
        }
      );
      showToast("success", "Cancel request submitted to admin successfully.");
      setCancelTarget(null);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = bookings.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (b) => {
    const now      = new Date();
    const checkIn  = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    if (now < checkIn)                      return { label: "Upcoming",  color: "bg-blue-100 text-blue-700"   };
    if (now >= checkIn && now <= checkOut)  return { label: "Active",    color: "bg-green-100 text-green-700" };
    return                                         { label: "Completed", color: "bg-gray-100 text-gray-600"   };
  };

  if (loading) return <OwnerBookingsShimmer />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSubmit={handleCancelSubmit}
          submitting={submitting}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-lg font-bold text-gray-800">📋 All Bookings</h1>
          </div>
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {filtered.length === 0 ? (
          <div className="text-center py-10 sm:py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((b) => {
              const status = getStatus(b);
              const isCancellable = status.label !== "Completed";
              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{b.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-gray-500 text-xs sm:text-sm break-words">
                        {b.email} · {b.phone}
                      </p>

                      {/* Booking ID — visible for reference */}
                      <p className="text-gray-300 text-xs font-mono mt-0.5 break-all">
                        #{b._id}
                      </p>

                      <div className="flex flex-col xs:flex-row flex-wrap gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <span>📅 Check-in: {new Date(b.checkIn).toLocaleDateString("en-IN")}</span>
                        <span>📅 Check-out: {new Date(b.checkOut).toLocaleDateString("en-IN")}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                        <span>🛏️ {b.rooms} room{b.rooms > 1 ? "s" : ""}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                        <span>🌙 {b.nights} night{b.nights > 1 ? "s" : ""}</span>
                      </div>

                      {b.specialRequests && (
                        <p className="text-xs text-gray-400 mt-1 break-words">💬 {b.specialRequests}</p>
                      )}
                    </div>

                    {/* Right — price + cancel button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-green-600">
                          ₹{b.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 sm:mt-1">
                          Booked {new Date(b.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      {isCancellable && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="text-xs font-semibold text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerBookings;