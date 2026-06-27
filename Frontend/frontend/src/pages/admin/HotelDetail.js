// ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelDetail.jsx
// Single hotel analytics — dark mode aware
// Route: /admin/hotel-analytics/:id
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import axios from "axios"
import { getToken } from "../../utils/auth"
import { toast } from "react-toastify"

const API    = `${process.env.REACT_APP_API_URL}/api/admin`
const COLORS = ["#10b981", "#f43f5e", "#f59e0b"]

// ── Dark palette helpers ──────────────────────────────────────
const dp = (dark) => ({
  bg:         dark ? "#0f1117" : "#f8f9fc",
  surface:    dark ? "#1a1d27" : "#ffffff",
  surface2:   dark ? "#22263a" : "#f9fafb",
  border:     dark ? "#2e3347" : "#e5e7eb",
  border2:    dark ? "#1a1d27" : "#f3f4f6",
  text1:      dark ? "#f0f2f8" : "#111827",
  text2:      dark ? "#8b90a7" : "#6b7280",
  text3:      dark ? "#555c78" : "#9ca3af",
  gridStroke: dark ? "#2e3347" : "#f3f4f6",
  tickFill:   dark ? "#555c78" : "#9ca3af",
  tooltip:    {
    borderRadius: 12,
    border: dark ? "1px solid #2e3347" : "none",
    boxShadow: dark ? "none" : "0 4px 20px rgba(0,0,0,0.08)",
    fontSize: 12,
    background: dark ? "#1a1d27" : "#fff",
    color: dark ? "#f0f2f8" : "#111827",
  },
})

const STATUS_STYLES_DARK = {
  success:  "bg-emerald-900/40 text-emerald-300",
  refunded: "bg-rose-900/40 text-rose-300",
  pending:  "bg-amber-900/40 text-amber-300",
}

const STATUS_STYLES_LIGHT = {
  success:  "bg-emerald-100 text-emerald-700",
  refunded: "bg-rose-100 text-rose-600",
  pending:  "bg-amber-100 text-amber-700",
}

// ── Dark mode hook ────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("admin-dark") === "true"; } catch { return false; }
  });
  const toggle = () => setDark((d) => {
    const next = !d;
    try { localStorage.setItem("admin-dark", String(next)); } catch {}
    return next;
  });
  return [dark, toggle];
}

// ── Shimmer ───────────────────────────────────────────────────
function HotelDetailShimmer({ dark }) {
  const p = dp(dark)
  const pulse = { background: dark ? "#22263a" : "#e5e7eb" }

  return (
    <div style={{ minHeight: "100vh", background: p.bg }}>
      <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }} className="animate-pulse">
        <div style={{ ...pulse, height: 32, width: 56, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ ...pulse, height: 20, width: 192, borderRadius: 6 }} />
          <div style={{ ...pulse, height: 12, width: 128, borderRadius: 6 }} />
        </div>
        <div style={{ ...pulse, height: 36, width: 96, borderRadius: 10, flexShrink: 0 }} />
      </div>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="animate-pulse">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...pulse, borderRadius: 16, height: 80 }} />
            ))}
          </div>
          <div style={{ ...pulse, borderRadius: 16, height: 280 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }} className="animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ ...pulse, borderRadius: 16, height: 220 }} />
          ))}
        </div>
        <div style={{ ...pulse, borderRadius: 16, height: 300 }} className="animate-pulse" />
      </div>
    </div>
  )
}

// ── Accept/Cancel Bar Chart ───────────────────────────────────
function AcceptCancelBarChart({ bookings, stats, dark }) {
  const p = dp(dark)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const now    = new Date()

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { name: months[d.getMonth()], Confirmed: 0, Cancelled: 0, Pending: 0 }
  })

  bookings.forEach(b => {
    const d = new Date(b.checkIn)
    const mName = months[d.getMonth()]
    const slot  = last6.find(s => s.name === mName)
    if (!slot) return
    if (b.paymentStatus === "success")  slot.Confirmed += 1
    if (b.paymentStatus === "refunded") slot.Cancelled  += 1
    if (b.paymentStatus === "pending")  slot.Pending    += 1
  })

  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: p.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Monthly</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 16 }}>Accept vs Cancel — Last 6 Months</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={last6} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: p.tickFill }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: p.tickFill }} />
          <Tooltip contentStyle={p.tooltip} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: p.text2 }} />
          <Bar dataKey="Confirmed" fill="#10b981" radius={[4,4,0,0]} />
          <Bar dataKey="Cancelled" fill="#f43f5e" radius={[4,4,0,0]} />
          <Bar dataKey="Pending"   fill="#f59e0b" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Booking Ratio Line Chart ──────────────────────────────────
function RatioLineChart({ bookings, dark }) {
  const p = dp(dark)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const now    = new Date()

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { name: months[d.getMonth()], total: 0, confirmed: 0, cancelled: 0 }
  })

  bookings.forEach(b => {
    const d    = new Date(b.checkIn)
    const slot = last6.find(s => s.name === months[d.getMonth()])
    if (!slot) return
    slot.total += 1
    if (b.paymentStatus === "success")  slot.confirmed += 1
    if (b.paymentStatus === "refunded") slot.cancelled  += 1
  })

  const data = last6.map(s => ({
    name:       s.name,
    "Accept %": s.total ? Math.round((s.confirmed / s.total) * 100) : 0,
    "Cancel %": s.total ? Math.round((s.cancelled / s.total) * 100) : 0,
  }))

  return (
    <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: p.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Rate</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 16 }}>Accept vs Cancel % Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: p.tickFill }} />
          <YAxis unit="%" tick={{ fontSize: 10, fill: p.tickFill }} domain={[0, 100]} />
          <Tooltip formatter={v => [`${v}%`]} contentStyle={p.tooltip} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: p.text2 }} />
          <Line type="monotone" dataKey="Accept %" stroke="#10b981" strokeWidth={2.5}
            dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Cancel %" stroke="#f43f5e" strokeWidth={2.5}
            dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState("bookings")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBookings, setUserBookings] = useState(null)
  const [dark, toggleDark]             = useDarkMode()
  const headers = { Authorization: `Bearer ${getToken()}` }
  const p = dp(dark)

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

  if (loading) return <HotelDetailShimmer dark={dark} />
  if (!data)   return null

  const { hotel, stats, bookings, reviews } = data

  const pieData = [
    { name: "Confirmed", value: stats.confirmed },
    { name: "Cancelled", value: stats.cancelled },
    { name: "Pending",   value: stats.pending   },
  ].filter(d => d.value > 0)

  const statCards = [
    { label: "Total Bookings", value: stats.totalBookings,                          accent: "#3b82f6", bg: dark ? "#0d1a2e" : "#eff6ff"  },
    { label: "Confirmed",      value: stats.confirmed,                               accent: "#10b981", bg: dark ? "#0d2e23" : "#ecfdf5"  },
    { label: "Cancelled",      value: stats.cancelled,                               accent: "#f43f5e", bg: dark ? "#2e1020" : "#fff1f2"  },
    { label: "Pending",        value: stats.pending,                                 accent: "#f59e0b", bg: dark ? "#2a1f08" : "#fffbeb"  },
    { label: "Revenue",        value: `₹${stats.revenue.toLocaleString("en-IN")}`,  accent: "#8b5cf6", bg: dark ? "#1e1230" : "#f5f3ff"  },
    { label: "Avg Rating",     value: `⭐ ${stats.avgRating}`,                       accent: "#f97316", bg: dark ? "#2a1800" : "#fff7ed"  },
  ]

  const statusStyle = (s) => dark
    ? (STATUS_STYLES_DARK[s] || "bg-gray-700 text-gray-300")
    : (STATUS_STYLES_LIGHT[s] || "bg-gray-100 text-gray-600")

  return (
    <div style={{ minHeight: "100vh", background: p.bg }}>

      {/* ── Header ── */}
      <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => navigate("/admin/dashboard")}
          style={{ color: p.text3, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          ← Back
        </button>

        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} style={{ width: 36, height: 36, borderRadius: 12, objectFit: "cover", flexShrink: 0, display: "none" }} className="sm:block" />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 12, background: p.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} className="hidden sm:flex">
            <span style={{ fontSize: 16 }}>🏨</span>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: p.text1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hotel.name}</h1>
            <span style={{ background: dark ? "#1e3a5f" : "#eff6ff", color: "#3b82f6", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999 }} className="hidden sm:inline-flex">
              {hotel.type}
            </span>
          </div>
          <p style={{ fontSize: 12, color: p.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {hotel.location}</p>
        </div>

        {/* Dark toggle */}
        <button
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
            background: dark ? "#22263a" : "#f3f4f6",
            color: dark ? "#fde68a" : "#6b7280",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>

        <button
          onClick={deleteHotel}
          style={{ background: "#f43f5e", color: "#fff", padding: "8px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          🗑️ <span className="hidden sm:inline">Delete Hotel</span>
        </button>
      </div>

      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px" }}>

        {/* ── Stats + Pie ── */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 16, padding: "12px 16px", borderTop: `1px solid ${p.border}`, borderRight: `1px solid ${p.border}`, borderBottom: `1px solid ${p.border}`, borderLeft: `3px solid ${s.accent}` }}>
                <p style={{ color: p.text3, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: p.text1, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, padding: "20px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: p.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Overview</p>
            <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 12 }}>Booking Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={38} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: dark ? "#555c78" : "#d1d5db" }}
                    strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={p.tooltip} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: p.text2 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 176 }}>
                <div style={{ textAlign: "center", color: p.text3 }}>
                  <p style={{ fontSize: 40, marginBottom: 8 }}>📊</p>
                  <p style={{ fontSize: 14 }}>No booking data yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Accept/Cancel Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <AcceptCancelBarChart bookings={bookings} stats={stats} dark={dark} />
          <RatioLineChart bookings={bookings} dark={dark} />
        </div>

        {/* ── Tabs ── */}
        <div style={{ background: p.surface, borderRadius: 16, border: `1px solid ${p.border}`, overflow: "hidden" }}>
          <div style={{ borderBottom: `1px solid ${p.border}`, display: "flex", overflowX: "auto" }}>
            {[
              { key: "bookings", label: `📋 Bookings (${stats.totalBookings})` },
              { key: "reviews",  label: `⭐ Reviews (${stats.reviewCount})`    },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "14px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: `2px solid ${activeTab === t.key ? "#3b82f6" : "transparent"}`,
                  color: activeTab === t.key ? "#3b82f6" : p.text3,
                  background: activeTab === t.key ? (dark ? "#1a2744" : "#eff6ff") : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Bookings tab ── */}
          {activeTab === "bookings" && (
            <div style={{ padding: "20px" }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: p.text3 }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
                  <p style={{ fontSize: 14 }}>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bookings.map(b => (
                    <div key={b._id} style={{ borderTop: `1px solid ${p.border2}`, borderRight: `1px solid ${p.border2}`, borderLeft: `1px solid ${p.border2}`, borderBottom: `1px solid ${p.border2}`, borderRadius: 12, padding: "12px 16px", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = p.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <button
                              onClick={() => b.userId && viewUserBookings(b.userId, b.userName)}
                              style={{ fontWeight: 700, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>
                              👤 {b.userName}
                            </button>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${statusStyle(b.paymentStatus)}`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                          <p style={{ color: p.text3, fontSize: 12, wordBreak: "break-word" }}>{b.userEmail} · 📞 {b.phone}</p>
                          <p style={{ color: p.text3, fontSize: 12, marginTop: 4, wordBreak: "break-word" }}>
                            📅 {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")}
                            · {b.nights} nights · {b.rooms} rooms · {b.guests} guests
                          </p>
                          <p style={{ color: p.text3, fontSize: 11, marginTop: 2, opacity: 0.6 }}>Order: {b.orderNumber}</p>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <p style={{ fontWeight: 800, color: "#10b981", fontSize: 15 }}>₹{b.totalPrice?.toLocaleString("en-IN")}</p>
                          <p style={{ color: p.text3, fontSize: 12 }}>{new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
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
            <div style={{ padding: "20px" }}>
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: p.text3 }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>⭐</p>
                  <p style={{ fontSize: 14 }}>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reviews.map(r => (
                    <div key={r._id} style={{ borderTop: `1px solid ${p.border2}`, borderRight: `1px solid ${p.border2}`, borderLeft: `1px solid ${p.border2}`, borderBottom: `1px solid ${p.border2}`, borderRadius: 12, padding: "12px 16px" }}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <button
                          onClick={() => r.userId && viewUserBookings(r.userId, r.userName)}
                          style={{ fontWeight: 600, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>
                          👤 {r.userName}
                        </button>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 14, color: s <= r.rating ? "#f59e0b" : dark ? "#374151" : "#e5e7eb" }}>★</span>
                          ))}
                        </div>
                      </div>
                      {r.userEmail && <p style={{ color: p.text3, fontSize: 12, marginBottom: 4 }}>{r.userEmail}</p>}
                      <p style={{ color: p.text2, fontSize: 13, wordBreak: "break-word" }}>{r.text}</p>
                      <p style={{ color: p.text3, fontSize: 11, marginTop: 6, opacity: 0.7 }}>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}
          className="sm:items-center">
          <div style={{ background: p.surface, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 512, maxHeight: "90vh", overflowY: "auto", border: `1px solid ${p.border}` }}
            className="sm:rounded-2xl">
            <div style={{ padding: "24px" }}>

              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                  <h3 style={{ fontWeight: 800, color: p.text1, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    👤 {selectedUser.name}
                  </h3>
                  <p style={{ color: p.text3, fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userBookings.user?.email}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 9999, marginTop: 6, display: "inline-block",
                    background: userBookings.user?.role === "admin" ? (dark ? "#2e1020" : "#fee2e2") : userBookings.user?.role === "hotelOwner" ? (dark ? "#1e1240" : "#f3e8ff") : (dark ? "#22263a" : "#f3f4f6"),
                    color: userBookings.user?.role === "admin" ? "#f43f5e" : userBookings.user?.role === "hotelOwner" ? "#8b5cf6" : p.text2,
                  }}>{userBookings.user?.role}</span>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setUserBookings(null) }}
                  style={{ color: p.text3, background: "none", border: "none", cursor: "pointer", fontSize: 28, lineHeight: 1, flexShrink: 0 }}>
                  ×
                </button>
              </div>

              {/* Stat chips */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Total",     value: userBookings.bookings.length, color: "#3b82f6", bg: dark ? "#0d1a2e" : "#eff6ff" },
                  { label: "Confirmed", value: userBookings.bookings.filter(b => b.paymentStatus === "success").length, color: "#10b981", bg: dark ? "#0d2e23" : "#ecfdf5" },
                  { label: "Cancelled", value: userBookings.bookings.filter(b => b.paymentStatus === "refunded").length, color: "#f43f5e", bg: dark ? "#2e1020" : "#fff1f2" },
                ].map((chip, i) => (
                  <div key={i} style={{ background: chip.bg, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: p.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{chip.label}</p>
                    <p style={{ fontWeight: 800, color: chip.color, fontSize: 20, marginTop: 4 }}>{chip.value}</p>
                  </div>
                ))}
              </div>

              {/* Bookings list */}
              <p style={{ fontWeight: 700, color: p.text1, fontSize: 14, marginBottom: 10 }}>All Bookings</p>
              <div className="space-y-2 mb-5">
                {userBookings.bookings.length === 0 ? (
                  <p style={{ color: p.text3, fontSize: 14, textAlign: "center", padding: "16px 0" }}>No bookings found</p>
                ) : userBookings.bookings.map(b => (
                  <div key={b._id} style={{ background: p.surface2, borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: p.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.hotelName}</p>
                        <p style={{ fontSize: 12, color: p.text3, marginTop: 2 }}>
                          {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")} · {b.nights} nights
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 13, color: "#10b981" }}>₹{b.totalPrice?.toLocaleString("en-IN")}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusStyle(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {userBookings.user?.role !== "admin" && (
                <button
                  onClick={() => deleteUser(selectedUser.id, selectedUser.name)}
                  style={{ width: "100%", background: "#f43f5e", color: "#fff", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
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