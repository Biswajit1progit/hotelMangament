import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/auth";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
    const now = new Date();
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    if (now < checkIn) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
    if (now >= checkIn && now <= checkOut) return { label: "Active", color: "bg-green-100 text-green-700" };
    return { label: "Completed", color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/owner/dashboard")} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">📋 All Bookings</h1>
        </div>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-56 outline-none focus:border-blue-400"
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse py-12">Loading bookings...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => {
              const status = getStatus(b);
              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{b.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{b.email} · {b.phone}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📅 Check-in: {new Date(b.checkIn).toLocaleDateString("en-IN")}</span>
                        <span>📅 Check-out: {new Date(b.checkOut).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500">
                        <span>🛏️ {b.rooms} room{b.rooms > 1 ? "s" : ""}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                        <span>🌙 {b.nights} night{b.nights > 1 ? "s" : ""}</span>
                      </div>
                      {b.specialRequests && (
                        <p className="text-xs text-gray-400 mt-1">💬 {b.specialRequests}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">₹{b.totalPrice?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">Booked {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
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