import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser } from "../../utils/auth";
import { toast } from "react-toastify";

const API = `${process.env.REACT_APP_API_URL}/api/admin`;

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

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState({});
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => { fetchStats(); fetchRequests(); }, []);

  const headers = { Authorization: `Bearer ${getToken()}` };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`, { headers });
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    const res = await axios.get(`${API}/requests`, { headers });
    setRequests(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`, { headers });
    setUsers(res.data);
  };

  const fetchHotels = async () => {
    const res = await axios.get(`${API}/hotels`, { headers });
    setHotels(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get(`${API}/bookings`, { headers });
    setBookings(res.data);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "users" && users.length === 0) fetchUsers();
    if (tab === "hotels" && hotels.length === 0) fetchHotels();
    if (tab === "bookings" && bookings.length === 0) fetchBookings();
  };

  const resolveRequest = async (id, status) => {
    try {
      await axios.patch(`${API}/requests/${id}`,
        { status, adminNote: adminNote[id] || "" },
        { headers }
      );
      toast.success(`Request ${status} ✅`);
      fetchRequests();
      fetchStats();
    } catch (err) {
      toast.error("Failed to resolve request");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`${API}/users/${id}`, { headers });
    toast.success("User deleted");
    fetchUsers();
  };

  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };

  const TABS = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "requests", label: `📝 Requests ${stats?.pendingRequests > 0 ? `(${stats.pendingRequests})` : ""}` },
    { key: "hotels", label: "🏨 Hotels" },
    { key: "users", label: "👥 Users" },
    { key: "bookings", label: "📋 Bookings" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading admin panel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🔐 Admin Panel</h1>
          <p className="text-sm text-gray-500">SafarSetu Administration · {user?.name}</p>
        </div>
        <button onClick={handleLogout}
          className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === t.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon="🏨" label="Total Hotels" value={stats?.totalHotels || 0} color="border-blue-500" />
              <StatCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} color="border-green-500" />
              <StatCard icon="🏢" label="Hotel Owners" value={stats?.totalOwners || 0} color="border-purple-500" />
              <StatCard icon="📋" label="Total Bookings" value={stats?.totalBookings || 0} color="border-orange-500" />
              <StatCard icon="💰" label="Platform Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} color="border-yellow-500" />
              <StatCard icon="⏳" label="Pending Requests" value={stats?.pendingRequests || 0} color="border-red-500" />
            </div>

            {/* Recent Pending Requests */}
            {stats?.recentRequests?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">⚡ Pending Requests</h3>
                  <button onClick={() => handleTabChange("requests")} className="text-blue-600 text-sm hover:underline">View all →</button>
                </div>
                {stats.recentRequests.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl mb-2">
                    <div>
                      <p className="font-medium text-sm">{r.ownerName} — {r.type.replace(/_/g, " ")}</p>
                      <p className="text-gray-400 text-xs">{r.reason}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {["", "pending", "approved", "rejected"].map((s) => (
                <button key={s}
                  onClick={async () => {
                    const res = await axios.get(`${API}/requests${s ? `?status=${s}` : ""}`, { headers });
                    setRequests(res.data);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm border hover:bg-gray-50 transition capitalize">
                  {s || "All"}
                </button>
              ))}
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📭</p><p>No requests found</p>
              </div>
            ) : requests.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{r.type.replace(/_/g, " ").toUpperCase()}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">From: <span className="font-medium">{r.ownerName}</span> ({r.ownerEmail})</p>
                    <p className="text-sm text-gray-500 mt-1">Reason: {r.reason}</p>
                    {r.details && Object.keys(r.details).length > 0 && (
                      <div className="mt-2 bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Request Details:</p>
                        {Object.entries(r.details).map(([k, v]) => (
                          <p key={k} className="text-xs text-gray-600">{k}: <span className="font-medium">{String(v)}</span></p>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-400 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex flex-col gap-2 min-w-48">
                      <textarea
                        placeholder="Admin note (optional)"
                        rows={2}
                        onChange={(e) => setAdminNote({ ...adminNote, [r._id]: e.target.value })}
                        className="border rounded-lg p-2 text-xs resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => resolveRequest(r._id, "approved")}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">
                          ✅ Approve
                        </button>
                        <button onClick={() => resolveRequest(r._id, "rejected")}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === "hotels" && (
          <div className="space-y-3">
            {hotels.map((h) => (
              <div key={h._id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{h.name}</p>
                  <p className="text-gray-500 text-sm">{h.district}, {h.state}</p>
                  <p className="text-gray-400 text-xs mt-1">₹{h.pricePerNight}/night · {h.rooms} rooms · ⭐{h.averageRating?.toFixed(1)}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{h.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-gray-500 text-sm">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    u.role === "admin" ? "bg-red-100 text-red-600" :
                    u.role === "hotelOwner" ? "bg-purple-100 text-purple-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>{u.role}</span>
                  {u.role !== "admin" && (
                    <button onClick={() => deleteUser(u._id)}
                      className="text-red-400 hover:text-red-600 text-sm transition">🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{b.hotelName}</p>
                    <p className="text-gray-600 text-sm">{b.name} · {b.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")} · {b.nights} nights · {b.rooms} rooms
                    </p>
                  </div>
                  <p className="font-bold text-green-600">₹{b.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;