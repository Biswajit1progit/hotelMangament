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
  success:  "bg-green-100 text-green-700",
  refunded: "bg-red-100 text-red-600",
  pending:  "bg-yellow-100 text-yellow-700",
}

// ── Shimmer ───────────────────────────────────────────────────
function HotelDetailShimmer() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center gap-3 animate-pulse">
        <div className="h-8 w-14 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="h-5 bg-gray-200 rounded w-48 max-w-full" />
          <div className="h-3 bg-gray-200 rounded w-32 max-w-full" />
        </div>
        {/* Delete button — hidden on mobile to match real header */}
        <div className="h-9 w-24 sm:w-28 bg-gray-200 rounded-lg flex-shrink-0" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Stats + Pie — stack on mobile, side by side on lg */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Stat cards — 2 cols always */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 border-gray-200 flex flex-col gap-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>

          {/* Pie placeholder */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse flex flex-col gap-3 sm:gap-4">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="flex items-center justify-center py-3 sm:py-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 rounded-full" />
            </div>
            <div className="flex justify-center gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-14 sm:w-16" />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs + rows */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div className="border-b flex px-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 sm:h-11 bg-gray-200 rounded mx-2 my-2 w-28 sm:w-40" />
            ))}
          </div>
          <div className="p-3 sm:p-5 flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-4 bg-gray-200 rounded w-28" />
                      <div className="h-5 bg-gray-200 rounded-full w-16" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full sm:w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-2/5" />
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="h-5 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState("bookings")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBookings, setUserBookings] = useState(null)
  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/analytics/hotel/${id}`, { headers })
      setData(res.data)
    } catch {
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

  if (loading) return <HotelDetailShimmer />
  if (!data)   return null

  const { hotel, stats, bookings, reviews } = data

  const pieData = [
    { name: "Confirmed", value: stats.confirmed },
    { name: "Cancelled", value: stats.cancelled },
    { name: "Pending",   value: stats.pending   },
  ].filter(d => d.value > 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-gray-500 hover:text-gray-800 transition text-base sm:text-lg flex-shrink-0">
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">{hotel.name}</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">{hotel.location} · {hotel.type}</p>
        </div>
        <button
          onClick={deleteHotel}
          className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition flex-shrink-0">
          🗑️ <span className="hidden sm:inline">Delete Hotel</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Stats + Pie — stack on mobile, 2 cols on lg ── */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: "Total Bookings", value: stats.totalBookings,                          color: "border-blue-500"   },
              { label: "Confirmed",      value: stats.confirmed,                               color: "border-green-500"  },
              { label: "Cancelled",      value: stats.cancelled,                               color: "border-red-500"    },
              { label: "Pending",        value: stats.pending,                                 color: "border-yellow-500" },
              { label: "Revenue",        value: `₹${stats.revenue.toLocaleString("en-IN")}`,  color: "border-purple-500" },
              { label: "Avg Rating",     value: `⭐ ${stats.avgRating}`,                       color: "border-orange-500" },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 ${s.color}`}>
                <p className="text-gray-500 text-xs truncate">{s.label}</p>
                <p className="text-lg sm:text-xl font-bold mt-1 truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-3 sm:mb-4">
              Booking Distribution
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={70} innerRadius={35}
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
              <div className="flex items-center justify-center h-40 sm:h-48 text-gray-400">
                <p className="text-sm">No booking data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {[
              { key: "bookings", label: `📋 Bookings (${stats.totalBookings})` },
              { key: "reviews",  label: `⭐ Reviews (${stats.reviewCount})`    },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === t.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Bookings tab ── */}
          {activeTab === "bookings" && (
            <div className="p-3 sm:p-5">
              {bookings.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-gray-400">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b._id}
                      className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition">
                      {/* Stack on mobile, side by side on sm+ */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <button
                              onClick={() => b.userId && viewUserBookings(b.userId, b.userName)}
                              className="font-bold text-blue-600 hover:underline text-sm">
                              👤 {b.userName}
                            </button>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm break-words">
                            {b.userEmail} · 📞 {b.phone}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 break-words">
                            📅 {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")}
                            · {b.nights} nights · {b.rooms} rooms · {b.guests} guests
                          </p>
                          <p className="text-gray-400 text-xs">Order: {b.orderNumber}</p>
                        </div>
                        {/* Price — left aligned on mobile, right on sm+ */}
                        <div className="flex sm:flex-col sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                          <p className="font-bold text-green-600 text-sm sm:text-base">
                            ₹{b.totalPrice?.toLocaleString("en-IN")}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(b.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews tab ── */}
          {activeTab === "reviews" && (
            <div className="p-3 sm:p-5">
              {reviews.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-gray-400">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r._id} className="border border-gray-100 rounded-xl p-3 sm:p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <button
                          onClick={() => r.userId && viewUserBookings(r.userId, r.userName)}
                          className="font-medium text-blue-600 hover:underline text-sm">
                          👤 {r.userName}
                        </button>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= r.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                          ))}
                        </div>
                      </div>
                      {r.userEmail && (
                        <p className="text-gray-400 text-xs mb-1">{r.userEmail}</p>
                      )}
                      <p className="text-gray-600 text-xs sm:text-sm break-words">{r.text}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── User detail modal ── */}
      {selectedUser && userBookings && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          {/* Slides up from bottom on mobile, centered on sm+ */}
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">

              {/* Modal header */}
              <div className="flex items-start justify-between mb-4 sm:mb-5">
                <div className="min-w-0 flex-1 mr-3">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                    👤 {selectedUser.name}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm truncate">{userBookings.user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    userBookings.user?.role === "admin"      ? "bg-red-100 text-red-600" :
                    userBookings.user?.role === "hotelOwner" ? "bg-purple-100 text-purple-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>{userBookings.user?.role}</span>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setUserBookings(null) }}
                  className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0 leading-none">
                  ×
                </button>
              </div>

              {/* User stat cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-blue-600 text-sm sm:text-base">
                    {userBookings.bookings.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-2 sm:p-3 text-center">
                  <p className="text-xs text-gray-500">Confirmed</p>
                  <p className="font-bold text-green-600 text-sm sm:text-base">
                    {userBookings.bookings.filter(b => b.paymentStatus === "success").length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-2 sm:p-3 text-center">
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="font-bold text-red-500 text-sm sm:text-base">
                    {userBookings.bookings.filter(b => b.paymentStatus === "refunded").length}
                  </p>
                </div>
              </div>

              {/* Bookings list */}
              <div className="space-y-2 mb-4 sm:mb-5">
                <p className="font-medium text-gray-700 text-sm mb-2">All Bookings</p>
                {userBookings.bookings.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No bookings found</p>
                ) : userBookings.bookings.map(b => (
                  <div key={b._id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                          {b.hotelName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(b.checkIn).toLocaleDateString("en-IN")} →{" "}
                          {new Date(b.checkOut).toLocaleDateString("en-IN")} · {b.nights} nights
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xs sm:text-sm text-green-600">
                          ₹{b.totalPrice?.toLocaleString("en-IN")}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete user */}
              {userBookings.user?.role !== "admin" && (
                <button
                  onClick={() => deleteUser(selectedUser.id, selectedUser.name)}
                  className="w-full bg-red-500 text-white py-2.5 sm:py-3 rounded-xl text-sm font-medium hover:bg-red-600 transition">
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