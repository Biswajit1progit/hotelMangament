 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser } from "../../utils/auth";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchStats();
  }, []);

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

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🏨 Owner Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/owner/bookings")}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
            📋 Bookings
          </button>
          <button onClick={() => navigate("/owner/requests")}
            className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition">
            📝 Requests
            {stats?.pendingRequests > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {stats.pendingRequests}
              </span>
            )}
          </button>
          <button onClick={handleLogout}
            className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Hotel Name */}
        {stats?.hotelName && (
          <div className="bg-blue-600 text-white rounded-2xl p-5 mb-6">
            <p className="text-blue-100 text-sm">Your Hotel</p>
            <h2 className="text-2xl font-bold mt-1">{stats.hotelName}</h2>
          </div>
        )}

        {!stats?.hotelName && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800">No hotel listed yet</p>
              <p className="text-sm text-yellow-600 mt-1">Submit a request to admin to list your hotel</p>
            </div>
            <button onClick={() => navigate("/owner/requests")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition">
              + Add Hotel Request
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Bookings" value={stats?.totalBookings || 0} color="border-blue-500" />
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} color="border-green-500" />
          <StatCard icon="🛏️" label="Occupied Rooms" value={`${stats?.occupiedRooms || 0}/${stats?.totalRooms || 0}`} color="border-orange-500" />
          <StatCard icon="✅" label="Available Rooms" value={stats?.availableRooms || 0} color="border-purple-500" />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Bookings</h3>
            <button onClick={() => navigate("/owner/bookings")}
              className="text-blue-600 text-sm hover:underline">View all →</button>
          </div>

          {stats?.recentBookings?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentBookings?.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{b.name}</p>
                    <p className="text-gray-400 text-xs">{b.email}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-sm">₹{b.totalPrice}</p>
                    <p className="text-gray-400 text-xs">{b.rooms} room{b.rooms > 1 ? "s" : ""} · {b.nights} night{b.nights > 1 ? "s" : ""}</p>
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