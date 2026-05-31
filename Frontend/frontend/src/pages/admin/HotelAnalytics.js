// ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelAnalytics.jsx
// Hotel analytics tab — shows all hotels with pie charts
// Import and use inside AdminDashboard.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import axios from "axios"
import { getToken } from "../../utils/auth"
import { toast } from "react-toastify"

const API = `${process.env.REACT_APP_API_URL}/api/admin`
const COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

// ── Shimmer skeleton ──────────────────────────────────────────
function AnalyticsShimmer() {
  return (
    <div>
      {/* Summary cards — 2 cols mobile → 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/5" />
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-6" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5 animate-pulse">
        <div className="h-9 sm:h-10 bg-gray-200 rounded-xl flex-1 min-w-36" />
        <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-32 sm:w-36" />
      </div>

      {/* Hotel cards */}
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded-full w-12 sm:w-14" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
                <div className="flex flex-wrap gap-3 mt-1">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex flex-col gap-1">
                      <div className="h-2.5 bg-gray-200 rounded w-8 sm:w-10" />
                      <div className="h-4 bg-gray-200 rounded w-6 sm:w-8" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="h-7 sm:h-8 bg-gray-200 rounded-lg w-24 sm:w-28" />
                  <div className="h-7 sm:h-8 bg-gray-200 rounded-lg w-20 sm:w-24" />
                </div>
              </div>
              <div className="hidden sm:block w-20 h-20 bg-gray-200 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mini pie chart ────────────────────────────────────────────
function MiniPie({ confirmed, cancelled, pending }) {
  const data = [
    { name: "Confirmed", value: confirmed },
    { name: "Cancelled", value: cancelled },
    { name: "Pending",   value: pending },
  ].filter(d => d.value > 0)

  if (data.length === 0) return (
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-xs text-gray-400">No data</span>
    </div>
  )

  return (
    <ResponsiveContainer width={80} height={80}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={35} innerRadius={18}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [v, n]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Main component ────────────────────────────────────────────
export default function HotelAnalytics() {
  const [hotels, setHotels]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [sortBy, setSortBy]   = useState("bookings")
  const navigate = useNavigate()
  const headers  = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchHotels() }, [])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/analytics/hotels`, { headers })
      setHotels(res.data)
    } catch {
      toast.error("Failed to load hotel analytics")
    } finally {
      setLoading(false)
    }
  }

  const deleteHotel = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its data?`)) return
    try {
      await axios.delete(`${API}/analytics/hotel/${id}`, { headers })
      toast.success("Hotel deleted ✅")
      fetchHotels()
    } catch {
      toast.error("Failed to delete hotel")
    }
  }

  const filtered = hotels
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "bookings")  return b.totalBookings     - a.totalBookings
      if (sortBy === "revenue")   return b.revenue           - a.revenue
      if (sortBy === "rating")    return (b.avgRating || 0)  - (a.avgRating || 0)
      if (sortBy === "cancelled") return b.cancelledBookings - a.cancelledBookings
      return 0
    })

  if (loading) return <AnalyticsShimmer />

  return (
    <div>

      {/* ── Summary bar — 2 cols mobile → 4 cols desktop ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: "Total Hotels",    value: hotels.length,                                                          icon: "🏨", color: "border-blue-500"   },
          { label: "Total Bookings",  value: hotels.reduce((s, h) => s + h.totalBookings,     0),                   icon: "📋", color: "border-green-500"  },
          { label: "Total Cancelled", value: hotels.reduce((s, h) => s + h.cancelledBookings, 0),                   icon: "❌", color: "border-red-500"    },
          { label: "Total Revenue",   value: `₹${hotels.reduce((s, h) => s + h.revenue, 0).toLocaleString("en-IN")}`, icon: "💰", color: "border-yellow-500" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-3 sm:p-4 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-gray-500 text-xs sm:text-sm truncate">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold mt-1 truncate">{s.value}</p>
            <span className="text-xl sm:text-2xl">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* ── Filters — stack on very small screens ── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
        <input
          placeholder="Search hotels..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-xl px-3 sm:px-4 py-2 text-sm flex-1 min-w-36 focus:outline-none focus:border-blue-400"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-xl px-3 sm:px-4 py-2 text-sm w-full sm:w-auto"
        >
          <option value="bookings">Sort by Bookings</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="rating">Sort by Rating</option>
          <option value="cancelled">Sort by Cancelled</option>
        </select>
      </div>

      {/* ── Hotel cards ── */}
      <div className="space-y-3 sm:space-y-4">
        {filtered.map(hotel => (
          <div key={hotel._id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">

              {/* Image — smaller on mobile */}
              {hotel.image ? (
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl sm:text-3xl">🏨</span>
                </div>
              )}

              {/* Hotel info */}
              <div className="flex-1 min-w-0">

                {/* Name + type badge */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{hotel.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">{hotel.location}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      ₹{hotel.pricePerNight}/night · ⭐{hotel.avgRating} ({hotel.reviewCount} reviews)
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                    {hotel.type}
                  </span>
                </div>

                {/* Stats row — wraps on narrow screens */}
                <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{hotel.totalBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Confirmed</p>
                    <p className="font-bold text-green-600 text-sm sm:text-base">{hotel.confirmedBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Cancelled</p>
                    <p className="font-bold text-red-500 text-sm sm:text-base">{hotel.cancelledBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="font-bold text-yellow-600 text-sm sm:text-base">
                      ₹{hotel.revenue.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Action buttons — full width on mobile */}
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                  <button
                    onClick={() => navigate(`/admin/hotel-analytics/${hotel._id}`)}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition text-center"
                  >
                    View Details →
                  </button>
                  <button
                    onClick={() => deleteHotel(hotel._id, hotel.name)}
                    className="flex-1 sm:flex-none bg-red-50 text-red-500 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition text-center"
                  >
                    🗑️ Delete Hotel
                  </button>
                </div>
              </div>

              {/* Mini pie — hidden on mobile */}
              <div className="flex-shrink-0 hidden sm:block">
                <MiniPie
                  confirmed={hotel.confirmedBookings}
                  cancelled={hotel.cancelledBookings}
                  pending={hotel.totalBookings - hotel.confirmedBookings - hotel.cancelledBookings}
                />
                <div className="flex gap-2 mt-1 justify-center">
                  <span className="text-xs text-green-600">✓ Conf</span>
                  <span className="text-xs text-red-500">✗ Canc</span>
                </div>
              </div>

            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 sm:py-16 text-gray-400">
            <p className="text-4xl mb-3">🏨</p>
            <p>No hotels found</p>
          </div>
        )}
      </div>
    </div>
  )
}