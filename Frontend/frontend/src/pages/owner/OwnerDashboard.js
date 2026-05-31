// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerDashboard.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser } from "../../utils/auth";
import ContactForm from "../../component/ContactForm"
const API = `${process.env.REACT_APP_API_URL}/api/owners`;

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1 mr-2">
        <p className="text-gray-500 text-xs sm:text-sm truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
      </div>
      <span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
    </div>
  </div>
);

// ── Shimmer skeleton ──────────────────────────────────────────
function OwnerDashboardShimmer() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-36 sm:w-44" />
          <div className="h-3 bg-gray-200 rounded w-24 sm:w-32" />
        </div>
        {/* Nav buttons */}
        <div className="flex gap-2">
          <div className="h-9 w-20 sm:w-24 bg-gray-200 rounded-lg" />
          <div className="h-9 w-20 sm:w-24 bg-gray-200 rounded-lg" />
          <div className="h-9 w-16 sm:w-20 bg-gray-200 rounded-lg" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Hotel name banner */}
        <div className="bg-gray-200 rounded-2xl p-5 mb-5 sm:mb-6 animate-pulse">
          <div className="h-3 bg-gray-300 rounded w-20 mb-2" />
          <div className="h-7 bg-gray-300 rounded w-1/2" />
        </div>

        {/* Stat cards — 2 cols mobile → 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-200 rounded w-3/5" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function OwnerDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const user                  = getUser();

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };

  if (loading) return <OwnerDashboardShimmer />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">🏨 Owner Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">Welcome, {user?.name}</p>
        </div>

        {/* Nav buttons — icon only on xs, icon+label on sm+ */}
        <div className="flex gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/owner/bookings")}
            className="bg-blue-50 text-blue-600 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition">
            📋 <span className="hidden sm:inline">Bookings</span>
          </button>
          <button
            onClick={() => navigate("/owner/requests")}
            className="relative bg-yellow-50 text-yellow-600 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-100 transition">
            📝 <span className="hidden sm:inline">Requests</span>
            {stats?.pendingRequests > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {stats.pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-500 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition">
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">🚪</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Hotel name banner ── */}
        {stats?.hotelName && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
            <p className="text-blue-100 text-xs sm:text-sm">Your Hotel</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 truncate">{stats.hotelName}</h2>
          </div>
        )}

        {/* ── No hotel banner ── */}
        {!stats?.hotelName && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800 text-sm sm:text-base">No hotel listed yet</p>
              <p className="text-xs sm:text-sm text-yellow-600 mt-1">Submit a request to admin to list your hotel</p>
            </div>
            <button
              onClick={() => navigate("/owner/requests")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-600 transition w-full sm:w-auto text-center flex-shrink-0">
              + Add Hotel Request
            </button>
          </div>
        )}

        {/* ── Stat cards — 2 cols mobile → 4 cols desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon="📋" label="Total Bookings"  value={stats?.totalBookings || 0}                              color="border-blue-500"   />
          <StatCard icon="💰" label="Total Revenue"   value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}      color="border-green-500"  />
          <StatCard icon="🛏️" label="Occupied Rooms"  value={`${stats?.occupiedRooms || 0}/${stats?.totalRooms || 0}`} color="border-orange-500" />
          <StatCard icon="✅" label="Available Rooms" value={stats?.availableRooms || 0}                             color="border-purple-500" />
        </div>

        {/* ── Recent Bookings ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Recent Bookings</h3>
            <button
              onClick={() => navigate("/owner/bookings")}
              className="text-blue-600 text-xs sm:text-sm hover:underline flex-shrink-0 ml-2">
              View all →
            </button>
          </div>

          {stats?.recentBookings?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {stats?.recentBookings?.map((b) => (
                <div key={b._id}
                  className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{b.name}</p>
                    <p className="text-gray-400 text-xs truncate">{b.email}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-600 text-xs sm:text-sm">₹{b.totalPrice}</p>
                    <p className="text-gray-400 text-xs">
                      {b.rooms} room{b.rooms > 1 ? "s" : ""} · {b.nights} night{b.nights > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OwnerDashboard;