// ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelAnalytics.jsx
// Hotel analytics tab — dark mode aware
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import axios from "axios"
import { getToken } from "../../utils/auth"
import { toast } from "react-toastify"

const API        = `${process.env.REACT_APP_API_URL}/api/admin`
const COLORS     = ["#10b981", "#f43f5e", "#f59e0b"]
const CAT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#e11d48"]

// ── Dark palette helpers ──────────────────────────────────────
const dp = (dark) => ({
  bg:         dark ? "#0f1117" : "#f3f4f6",
  surface:    dark ? "#1a1d27" : "#ffffff",
  surface2:   dark ? "#22263a" : "#f9fafb",
  border:     dark ? "#2e3347" : "#e5e7eb",
  text1:      dark ? "#f0f2f8" : "#111827",
  text2:      dark ? "#8b90a7" : "#6b7280",
  text3:      dark ? "#555c78" : "#9ca3af",
  gridStroke: dark ? "#2e3347" : "#f3f4f6",
  tickFill:   dark ? "#555c78" : "#9ca3af",
  tooltip:    dark ? { background: "#1a1d27", border: "1px solid #2e3347", borderRadius: 12, fontSize: 12 }
                   : { borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 },
})

// ── Shimmer ───────────────────────────────────────────────────
function AnalyticsShimmer({ dark }) {
  const p = dp(dark)
  const pulse = { background: dark ? "#22263a" : "#f3f4f6" }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: p.surface, borderRadius: 16 }} className="p-4 shadow-sm animate-pulse flex flex-col gap-2">
            <div className="h-3 rounded w-3/4" style={pulse} />
            <div className="h-6 rounded w-2/5" style={pulse} />
            <div className="h-4 rounded w-6" style={pulse} />
          </div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: p.surface, borderRadius: 16 }} className="shadow-sm p-5 animate-pulse h-36" />
      ))}
    </div>
  )
}

// ── Mini donut ────────────────────────────────────────────────
function MiniPie({ confirmed, cancelled, pending, dark }) {
  const p = dp(dark)
  const data = [
    { name: "Confirmed", value: confirmed },
    { name: "Cancelled", value: cancelled },
    { name: "Pending",   value: pending   },
  ].filter(d => d.value > 0)

  if (!data.length)
    return (
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: p.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10, color: p.text3 }}>Empty</span>
      </div>
    )

  return (
    <ResponsiveContainer width={72} height={72}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={32} innerRadius={16} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [v, n]} contentStyle={p.tooltip} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Trend badge ───────────────────────────────────────────────
function TrendBadge({ value }) {
  if (value == null) return null
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
      value >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
    }`}>
      {value >= 0 ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  )
}

// ── Thin occupancy strip ──────────────────────────────────────
function OccupancyStrip({ rate, dark }) {
  const pct   = Math.min(100, Math.max(0, rate || 0))
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e"
  const p     = dp(dark)
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, background: p.surface2, borderRadius: 9999, height: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: p.text3 }}>{pct}%</span>
    </div>
  )
}

// ── Revenue bar chart ─────────────────────────────────────────
function RevenueBarChart({ hotels, dark }) {
  const p = dp(dark)
  const data = [...hotels]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map(h => ({
      name: h.name.length > 11 ? h.name.slice(0, 11) + "…" : h.name,
      revenue: h.revenue,
    }))
  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px 20px 12px", marginBottom: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: p.text3, fontWeight: 600, marginBottom: 2 }}>Revenue</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 16 }}>Hotel Name vs Revenue</h3>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: 0, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: p.tickFill }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} />
          <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={p.tooltip} />
          <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={`hsl(${215 + i * 15}, 65%, ${dark ? 45 + i * 2 : 52 + i * 3}%)`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bookings line chart ───────────────────────────────────────
function BookingsTrendChart({ hotels, dark }) {
  const p = dp(dark)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const now    = new Date()
  const last12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { month: months[d.getMonth()], year: d.getFullYear(), bookings: 0 }
  })
  hotels.forEach(hotel => {
    if (Array.isArray(hotel.bookingHistory)) {
      hotel.bookingHistory.forEach(({ month, year, bookings }) => {
        const idx = last12.findIndex(m => m.month === month && m.year === year)
        if (idx !== -1) last12[idx].bookings += bookings
      })
    }
  })
  const data = last12.map(m => ({ name: m.month, Bookings: m.bookings }))
  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px 20px 12px", marginBottom: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: p.text3, fontWeight: 600, marginBottom: 2 }}>Trend</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 16 }}>Bookings over Last 12 Months</h3>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={p.tooltip} />
          <Line type="monotone" dataKey="Bookings" stroke="#6366f1" strokeWidth={2.5}
            dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Category donut ────────────────────────────────────────────
function CategoryPieChart({ hotels, dark }) {
  const p = dp(dark)
  const map = {}
  hotels.forEach(h => { const t = h.type || "Other"; map[t] = (map[t] || 0) + 1 })
  const data = Object.entries(map).map(([name, value]) => ({ name, value }))
  if (!data.length) return null
  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px 20px 12px", marginBottom: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: p.text3, fontWeight: 600, marginBottom: 2 }}>Mix</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 16 }}>🥧 Category Distribution</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={68} innerRadius={38} paddingAngle={3} strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} contentStyle={p.tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
              <span style={{ fontSize: 14, color: p.text1 }}>{d.name}</span>
              <span style={{ fontSize: 12, color: p.text3, marginLeft: "auto", paddingLeft: 16 }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Professional Hotel Card ───────────────────────────────────
function HotelCard({ hotel, onDelete, onNavigate, dark }) {
  const p = dp(dark)
  const pending = hotel.totalBookings - hotel.confirmedBookings - hotel.cancelledBookings
  const confirmPct = hotel.totalBookings
    ? Math.round((hotel.confirmedBookings / hotel.totalBookings) * 100) : 0

  const kpiTiles = [
    { label: "Total",     value: hotel.totalBookings,     color: p.text1,        bg: p.surface2 },
    { label: "Confirmed", value: hotel.confirmedBookings, color: "#10b981",      bg: dark ? "#0d2e23" : "#ecfdf5" },
    { label: "Cancelled", value: hotel.cancelledBookings, color: "#f43f5e",      bg: dark ? "#2e1020" : "#fff1f2" },
    { label: "Revenue",   value: `₹${(hotel.revenue/1000).toFixed(0)}k`, color: "#f59e0b", bg: dark ? "#2a1f08" : "#fffbeb" },
  ]

  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, overflow: "hidden", transition: "box-shadow 0.2s" }}
      className="hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Accent strip */}
        <div className="hidden sm:block w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500 flex-shrink-0" />

        {/* Image */}
        <div className="sm:w-28 h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
          {hotel.image ? (
            <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: dark ? "#22263a" : "linear-gradient(135deg, #f1f5f9, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 40, opacity: 0.4 }}>🏨</span>
            </div>
          )}
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", color: "#1d4ed8", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999 }}>
            {hotel.type}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">

          {/* Row 1 — Name + badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 15, lineHeight: 1.3 }} className="truncate">{hotel.name}</h3>
                <TrendBadge value={hotel.bookingTrend} />
              </div>
              <p style={{ color: p.text3, fontSize: 12, marginTop: 2 }} className="truncate">📍 {hotel.location}</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: p.text1, flexShrink: 0 }}>
              ₹{hotel.pricePerNight?.toLocaleString("en-IN")}
              <span style={{ fontSize: 10, fontWeight: 400, color: p.text3 }}>/night</span>
            </span>
          </div>

          {/* Row 2 — Rating + occupancy */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: 12, color: s <= Math.round(hotel.avgRating || 0) ? "#f59e0b" : dark ? "#374151" : "#e5e7eb" }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: p.text1 }}>{hotel.avgRating || "—"}</span>
              <span style={{ fontSize: 12, color: p.text3 }}>({hotel.reviewCount || 0} reviews)</span>
            </div>
            {hotel.occupancyRate != null && (
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 12, color: p.text3 }}>Occupancy</span>
                <div style={{ width: 80 }}>
                  <OccupancyStrip rate={hotel.occupancyRate} dark={dark} />
                </div>
              </div>
            )}
          </div>

          {/* Row 3 — KPI tiles */}
          <div className="grid grid-cols-4 gap-2">
            {kpiTiles.map((k, i) => (
              <div key={i} style={{ background: k.bg, borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: k.color }}>{k.value}</p>
                <p style={{ fontSize: 10, color: p.text3, marginTop: 2 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Row 4 — Confirm rate bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: p.text3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Confirm Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>{confirmPct}%</span>
            </div>
            <div style={{ height: 6, background: dark ? "#22263a" : "#f3f4f6", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 9999, width: `${confirmPct}%`, background: "linear-gradient(to right, #34d399, #10b981)", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Row 5 — Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onNavigate}
              style={{ background: dark ? "#e2e8f0" : "#0f172a", color: dark ? "#0f172a" : "#fff", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "0.03em" }}>
              View Details →
            </button>
            <button onClick={onDelete}
              style={{ background: "none", border: `1px solid ${dark ? "#4b1c2c" : "#fecdd3"}`, color: "#f43f5e", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              🗑 Delete
            </button>
            <div className="hidden sm:flex flex-col items-center ml-auto">
              <MiniPie confirmed={hotel.confirmedBookings} cancelled={hotel.cancelledBookings} pending={pending} dark={dark} />
              <p style={{ fontSize: 9, color: p.text3, marginTop: 2, letterSpacing: "0.05em" }}>RATIO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function HotelAnalytics({ dark = false }) {
  const [hotels, setHotels]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [sortBy, setSortBy]   = useState("bookings")
  const navigate = useNavigate()
  const headers  = { Authorization: `Bearer ${getToken()}` }
  const p        = dp(dark)

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
      if (sortBy === "occupancy") return (b.occupancyRate || 0) - (a.occupancyRate || 0)
      return 0
    })

  if (loading) return <AnalyticsShimmer dark={dark} />

  const totalRevenue = hotels.reduce((s, h) => s + h.revenue, 0)

  const summaryCards = [
    { label: "Total Hotels",    value: hotels.length,                                 icon: "🏨", from: "from-blue-500",    to: "to-blue-600"    },
    { label: "Total Bookings",  value: hotels.reduce((s,h)=>s+h.totalBookings,0),     icon: "📋", from: "from-emerald-500", to: "to-emerald-600"  },
    { label: "Total Cancelled", value: hotels.reduce((s,h)=>s+h.cancelledBookings,0), icon: "❌", from: "from-rose-500",    to: "to-rose-600"    },
    { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`,    icon: "💰", from: "from-amber-500",   to: "to-amber-600"   },
  ]

  return (
    <div>
      {/* ── Summary bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {summaryCards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-4 shadow-sm text-white`}>
            <p className="text-white/70 text-xs font-medium truncate">{s.label}</p>
            <p className="text-xl font-bold mt-1 truncate tabular-nums">{s.value}</p>
            <span className="text-2xl opacity-60 mt-1 block">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RevenueBarChart hotels={hotels} dark={dark} />
        <CategoryPieChart hotels={hotels} dark={dark} />
      </div>
      <BookingsTrendChart hotels={hotels} dark={dark} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        <input
          placeholder="Search hotels…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: `1px solid ${p.border}`,
            borderRadius: 12,
            padding: "8px 16px",
            fontSize: 14,
            flex: 1,
            minWidth: 144,
            outline: "none",
            background: p.surface,
            color: p.text1,
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            border: `1px solid ${p.border}`,
            borderRadius: 12,
            padding: "8px 16px",
            fontSize: 14,
            background: p.surface,
            color: p.text1,
            outline: "none",
            width: "auto",
          }}
        >
          <option value="bookings">Sort by Bookings</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="rating">Sort by Rating</option>
          <option value="cancelled">Sort by Cancelled</option>
          <option value="occupancy">Sort by Occupancy</option>
        </select>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-3">
        {filtered.map(hotel => (
          <HotelCard
            key={hotel._id}
            hotel={hotel}
            dark={dark}
            onDelete={() => deleteHotel(hotel._id, hotel.name)}
            onNavigate={() => navigate(`/admin/hotel-analytics/${hotel._id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: dp(dark).text3 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🏨</p>
            <p style={{ fontSize: 14 }}>No hotels found</p>
          </div>
        )}
      </div>
    </div>
  )
}