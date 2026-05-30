 // ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelAnalytics.jsx
// Hotel analytics tab — shows all hotels with pie charts
// Import and use inside AdminDashboard.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import axios from "axios"
import { getToken } from "../../utils/auth"
import { toast } from "react-toastify"

const API = `${process.env.REACT_APP_API_URL}/api/admin`
const COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

// ── Mini pie chart for each hotel card ───────────────────────
function MiniPie({ confirmed, cancelled, pending }) {
  const data = [
    { name: "Confirmed", value: confirmed },
    { name: "Cancelled", value: cancelled },
    { name: "Pending", value: pending },
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

export default function HotelAnalytics() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("bookings")
  const navigate = useNavigate()
  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchHotels() }, [])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/analytics/hotels`, { headers })
      setHotels(res.data)
    } catch (err) {
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
      if (sortBy === "bookings") return b.totalBookings - a.totalBookings
      if (sortBy === "revenue") return b.revenue - a.revenue
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0)
      if (sortBy === "cancelled") return b.cancelledBookings - a.cancelledBookings
      return 0
    })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400 animate-pulse text-lg">Loading analytics...</p>
    </div>
  )

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Hotels", value: hotels.length, icon: "🏨", color: "border-blue-500" },
          { label: "Total Bookings", value: hotels.reduce((s, h) => s + h.totalBookings, 0), icon: "📋", color: "border-green-500" },
          { label: "Total Cancelled", value: hotels.reduce((s, h) => s + h.cancelledBookings, 0), icon: "❌", color: "border-red-500" },
          { label: "Total Revenue", value: `₹${hotels.reduce((s, h) => s + h.revenue, 0).toLocaleString("en-IN")}`, icon: "💰", color: "border-yellow-500" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
            <span className="text-2xl">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          placeholder="Search hotels..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-blue-400"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm"
        >
          <option value="bookings">Sort by Bookings</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="rating">Sort by Rating</option>
          <option value="cancelled">Sort by Cancelled</option>
        </select>
      </div>

      {/* Hotel cards */}
      <div className="space-y-4">
        {filtered.map(hotel => (
          <div key={hotel._id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-start gap-4">

              {/* Hotel image */}
              {hotel.image ? (
                <img src={hotel.image} alt={hotel.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🏨</span>
                </div>
              )}

              {/* Hotel info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{hotel.name}</h3>
                    <p className="text-gray-500 text-sm">{hotel.location}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      ₹{hotel.pricePerNight}/night · ⭐{hotel.avgRating} ({hotel.reviewCount} reviews)
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{hotel.type}</span>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-gray-800">{hotel.totalBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Confirmed</p>
                    <p className="font-bold text-green-600">{hotel.confirmedBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Cancelled</p>
                    <p className="font-bold text-red-500">{hotel.cancelledBookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="font-bold text-yellow-600">₹{hotel.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/admin/hotel-analytics/${hotel._id}`)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    View Details →
                  </button>
                  <button
                    onClick={() => deleteHotel(hotel._id, hotel.name)}
                    className="bg-red-50 text-red-500 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    🗑️ Delete Hotel
                  </button>
                </div>
              </div>

              {/* Mini pie chart */}
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
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏨</p>
            <p>No hotels found</p>
          </div>
        )}
      </div>
    </div>
  )
}