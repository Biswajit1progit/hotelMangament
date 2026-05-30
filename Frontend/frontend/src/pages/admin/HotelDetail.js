 // ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelDetail.jsx
// Single hotel full analytics — bookings, reviews, pie chart
// Route: /admin/hotel-analytics/:id
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"
import { getToken } from "../../utils/auth"
import { toast } from "react-toastify"

const API = `${process.env.REACT_APP_API_URL}/api/admin`
const COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

const STATUS_STYLES = {
  success: "bg-green-100 text-green-700",
  refunded: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
}

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("bookings")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBookings, setUserBookings] = useState(null)
  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/analytics/hotel/${id}`, { headers })
      setData(res.data)
    } catch (err) {
      toast.error("Failed to load hotel details")
    } finally {
      setLoading(false)
    }
  }

  const deleteHotel = async () => {
    if (!window.confirm(`Delete "${data.hotel.name}" and all its data?`)) return
    try {
      await axios.delete(`${API}/analytics/hotel/${id}`, { headers })
      toast.success("Hotel deleted ✅")
      navigate("/admin/dashboard")
    } catch {
      toast.error("Failed to delete hotel")
    }
  }

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return
    try {
      await axios.delete(`${API}/users/${userId}`, { headers })
      toast.success("User deleted ✅")
      setSelectedUser(null)
      fetchData()
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const viewUserBookings = async (userId, userName) => {
    try {
      const res = await axios.get(`${API}/analytics/user/${userId}`, { headers })
      setSelectedUser({ name: userName, id: userId })
      setUserBookings(res.data)
    } catch {
      toast.error("Failed to load user bookings")
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 animate-pulse text-lg">Loading hotel analytics...</p>
    </div>
  )

  if (!data) return null

  const { hotel, stats, bookings, reviews } = data

  const pieData = [
    { name: "Confirmed", value: stats.confirmed },
    { name: "Cancelled", value: stats.cancelled },
    { name: "Pending", value: stats.pending },
  ].filter(d => d.value > 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/admin/dashboard")}
          className="text-gray-500 hover:text-gray-800 transition text-lg">
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{hotel.name}</h1>
          <p className="text-sm text-gray-500">{hotel.location} · {hotel.type}</p>
        </div>
        <button onClick={deleteHotel}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
          🗑️ Delete Hotel
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats + Pie chart row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Bookings", value: stats.totalBookings, icon: "📋", color: "border-blue-500" },
              { label: "Confirmed", value: stats.confirmed, icon: "✅", color: "border-green-500" },
              { label: "Cancelled", value: stats.cancelled, icon: "❌", color: "border-red-500" },
              { label: "Pending", value: stats.pending, icon: "⏳", color: "border-yellow-500" },
              { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: "💰", color: "border-purple-500" },
              { label: "Avg Rating", value: `⭐ ${stats.avgRating}`, icon: "🌟", color: "border-orange-500" },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${s.color}`}>
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="text-xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Booking Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>No booking data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b flex">
            {[
              { key: "bookings", label: `📋 Bookings (${stats.totalBookings})` },
              { key: "reviews", label: `⭐ Reviews (${stats.reviewCount})` },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === t.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Bookings tab */}
          {activeTab === "bookings" && (
            <div className="p-5">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📋</p>
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => b.userId && viewUserBookings(b.userId, b.userName)}
                              className="font-bold text-blue-600 hover:underline text-sm"
                            >
                              👤 {b.userName}
                            </button>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">{b.userEmail} · 📞 {b.phone}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            📅 {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")}
                            · {b.nights} nights · {b.rooms} rooms · {b.guests} guests
                          </p>
                          <p className="text-gray-400 text-xs">Order: {b.orderNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{b.totalPrice?.toLocaleString("en-IN")}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div className="p-5">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">⭐</p>
                  <p>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => r.userId && viewUserBookings(r.userId, r.userName)}
                              className="font-medium text-blue-600 hover:underline text-sm"
                            >
                              👤 {r.userName}
                            </button>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={s <= r.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                              ))}
                            </div>
                          </div>
                          {r.userEmail && <p className="text-gray-400 text-xs">{r.userEmail}</p>}
                          <p className="text-gray-600 text-sm mt-2">{r.text}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && userBookings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">👤 {selectedUser.name}</h3>
                  <p className="text-gray-500 text-sm">{userBookings.user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    userBookings.user?.role === "admin" ? "bg-red-100 text-red-600" :
                    userBookings.user?.role === "hotelOwner" ? "bg-purple-100 text-purple-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>{userBookings.user?.role}</span>
                </div>
                <button onClick={() => { setSelectedUser(null); setUserBookings(null) }}
                  className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              {/* User stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Total Bookings</p>
                  <p className="font-bold text-blue-600">{userBookings.bookings.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Confirmed</p>
                  <p className="font-bold text-green-600">
                    {userBookings.bookings.filter(b => b.paymentStatus === "success").length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="font-bold text-red-500">
                    {userBookings.bookings.filter(b => b.paymentStatus === "refunded").length}
                  </p>
                </div>
              </div>

              {/* User bookings list */}
              <div className="space-y-2 mb-5">
                <p className="font-medium text-gray-700 text-sm mb-2">All Bookings</p>
                {userBookings.bookings.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No bookings found</p>
                ) : userBookings.bookings.map(b => (
                  <div key={b._id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{b.hotelName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")}
                          · {b.nights} nights
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">₹{b.totalPrice?.toLocaleString("en-IN")}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete user button */}
              {userBookings.user?.role !== "admin" && (
                <button
                  onClick={() => deleteUser(selectedUser.id, selectedUser.name)}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition"
                >
                  🗑️ Delete User Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}