// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerBookings.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/auth";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;

// ── Shimmer skeleton ──────────────────────────────────────────
function OwnerBookingsShimmer() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="h-8 w-14 sm:w-16 bg-gray-200 rounded-lg" />
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-28 sm:w-36" />
        </div>
        {/* Search bar */}
        <div className="h-9 sm:h-10 bg-gray-200 rounded-lg w-36 sm:w-56" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
              {/* Stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                {/* Left content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name + status badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-40" />
                    <div className="h-5 bg-gray-200 rounded-full w-16 sm:w-20" />
                  </div>
                  {/* Email · phone */}
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 sm:w-3/5" />
                  {/* Check-in / Check-out */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="h-3 bg-gray-200 rounded w-36 sm:w-44" />
                    <div className="h-3 bg-gray-200 rounded w-36 sm:w-44" />
                  </div>
                  {/* Rooms · guests · nights */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  {/* Special requests */}
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>

                {/* Right — price + date */}
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

// ── Main component ────────────────────────────────────────────
function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const navigate                = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = bookings.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (b) => {
    const now      = new Date();
    const checkIn  = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    if (now < checkIn)                        return { label: "Upcoming",  color: "bg-blue-100 text-blue-700"  };
    if (now >= checkIn && now <= checkOut)    return { label: "Active",    color: "bg-green-100 text-green-700" };
    return                                           { label: "Completed", color: "bg-gray-100 text-gray-600"  };
  };

  if (loading) return <OwnerBookingsShimmer />;

  return (
    <div className="min-h-screen bg-gray-50">

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

      <h1 className="text-lg font-bold text-gray-800">
        📋 All Bookings
      </h1>
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
              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                  {/* Stack on mobile, side-by-side on sm+ */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      {/* Name + badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{b.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {/* Email · phone — break on very small screens */}
                      <p className="text-gray-500 text-xs sm:text-sm break-words">
                        {b.email} · {b.phone}
                      </p>

                      {/* Dates — stack on xs, row on sm+ */}
                      <div className="flex flex-col xs:flex-row flex-wrap gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <span>📅 Check-in: {new Date(b.checkIn).toLocaleDateString("en-IN")}</span>
                        <span>📅 Check-out: {new Date(b.checkOut).toLocaleDateString("en-IN")}</span>
                      </div>

                      {/* Rooms · guests · nights */}
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                        <span>🛏️ {b.rooms} room{b.rooms > 1 ? "s" : ""}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                        <span>🌙 {b.nights} night{b.nights > 1 ? "s" : ""}</span>
                      </div>

                      {b.specialRequests && (
                        <p className="text-xs text-gray-400 mt-1 break-words">💬 {b.specialRequests}</p>
                      )}
                    </div>

                    {/* Right — price stays inline on mobile (flex-row), stacks on sm+ */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        ₹{b.totalPrice?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 sm:mt-1">
                        Booked {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </p>
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