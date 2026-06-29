

// ─────────────────────────────────────────────────────────────
// frontend/src/pages/admin/HotelAnalytics.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts"
import { toast } from "react-toastify"
import api from "../../services/apiClient"

const API        = "/api/admin"
const COLORS     = ["#10b981", "#f43f5e", "#f59e0b"]
const CAT_COLORS = ["#818cf8", "#f59e0b", "#34d399", "#60a5fa", "#fb7185"]

// ── Palette helpers ───────────────────────────────────────────
const dp = (dark) => ({
  bg:          dark ? "#080b14"  : "#f0f2f9",
  glass:       dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.70)",
  glassBorder: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.95)",
  glassHover:  dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.90)",
  surface:     dark ? "#0f1221" : "#ffffff",
  shimmerBase: dark ? "#141828" : "#eef0fa",
  shimmerBar:  dark ? "#252d4a" : "#d8dcf0",
  surface2:    dark ? "#1c2240" : "#eef0fa",
  border:      dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  text1:       dark ? "#e8eaf6" : "#1a1d2e",
  text2:       dark ? "#8b90b8" : "#5b6080",
  text3:       dark ? "#4a5080" : "#9ba3c0",
  gridStroke:  dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  tickFill:    dark ? "#4a5080" : "#9ba3c0",
  tooltip: {
    background:   dark ? "#0f1221" : "#ffffff",
    border:       `1px solid ${dark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)"}`,
    borderRadius: 12, fontSize: 12,
    color:        dark ? "#e8eaf6" : "#1a1d2e",
    boxShadow:    dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(99,102,241,0.12)",
  },
})

const glassStyle = (p, extra = {}) => ({
  background:           p.glass,
  backdropFilter:       "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border:               p.glassBorder,
  borderRadius:         20,
  ...extra,
})

// ── Shimmer ───────────────────────────────────────────────────
function AnalyticsShimmer({ dark }) {
  const p = dp(dark)
  const shimmerCard = { background: p.shimmerBase, borderRadius: 20, border: p.glassBorder }
  const bar = { background: p.shimmerBar, borderRadius: 9999 }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ ...shimmerCard, padding: 20 }} className="animate-pulse flex flex-col gap-3">
            <div className="h-3 w-3/4" style={bar} />
            <div className="h-7 w-2/5" style={bar} />
            <div className="h-5 w-6"   style={bar} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ ...shimmerCard, height: 280, padding: 20 }} className="animate-pulse flex flex-col gap-3">
            <div className="h-3 w-1/4" style={bar} />
            <div className="h-4 w-2/5" style={bar} />
            <div style={{ flex: 1, background: p.shimmerBar, borderRadius: 12, marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div style={{ ...shimmerCard, height: 240, padding: 20, marginBottom: 16 }} className="animate-pulse flex flex-col gap-3">
        <div className="h-3 w-1/4" style={bar} />
        <div className="h-4 w-1/3" style={bar} />
        <div style={{ flex: 1, background: p.shimmerBar, borderRadius: 12, marginTop: 8 }} />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ ...shimmerCard, overflow: "hidden" }} className="animate-pulse flex">
          <div style={{ width: 128, flexShrink: 0, background: p.shimmerBar }} />
          <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="h-4 w-2/3" style={bar} />
            <div className="h-3 w-1/3" style={bar} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[...Array(4)].map((_, j) => (
                <div key={j} style={{ height: 48, background: p.shimmerBar, borderRadius: 12 }} />
              ))}
            </div>
            <div className="h-2 w-full" style={bar} />
            <div className="flex gap-2">
              <div style={{ height: 34, width: 110, background: p.shimmerBar, borderRadius: 12 }} />
              <div style={{ height: 34, width: 90,  background: p.shimmerBar, borderRadius: 12 }} />
            </div>
          </div>
        </div>
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
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: p.surface2, border: p.glassBorder, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10, color: p.text3 }}>—</span>
      </div>
    )

  return (
    <ResponsiveContainer width={72} height={72}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={32} innerRadius={18} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [v, n]} contentStyle={p.tooltip} wrapperStyle={{ zIndex: 9999 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Trend badge ───────────────────────────────────────────────
function TrendBadge({ value }) {
  if (value == null) return null
  const up = value >= 0
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      fontSize: 11, fontWeight: 700, padding: "2px 8px",
      borderRadius: 9999, letterSpacing: "0.04em",
      background: up ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
      color:      up ? "#10b981" : "#f43f5e",
      border:     `1px solid ${up ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
    }}>
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  )
}

// ── Occupancy strip ───────────────────────────────────────────
function OccupancyStrip({ rate, dark }) {
  const pct   = Math.min(100, Math.max(0, rate || 0))
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e"
  const p     = dp(dark)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 9999, overflow: "hidden", background: p.surface2 }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${pct}%`, backgroundColor: color, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 6px ${color}88` }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{pct}%</span>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label, formatter, dark }) {
  const p = dp(dark)
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...p.tooltip, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: p.text3, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 700, color: entry.color || p.text1 }}>
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

// ── Revenue bar chart ─────────────────────────────────────────
function RevenueBarChart({ hotels, dark }) {
  const p = dp(dark)
  const data = [...hotels]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map(h => ({ name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name, revenue: h.revenue }))
  return (
    <div style={{ ...glassStyle(p), padding: "20px 20px 12px" }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#818cf8", fontWeight: 700, marginBottom: 2 }}>Revenue</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 15, marginBottom: 18 }}>Hotel Revenue Ranking</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: p.tickFill }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip dark={dark} formatter={v => `₹${v.toLocaleString("en-IN")}`} />} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={`hsl(${235 + i * 12}, 70%, ${dark ? 50 + i : 55 + i}%)`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bookings Area trend chart ─────────────────────────────────
function BookingsTrendChart({ hotels, dark }) {
  const p = dp(dark)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const now    = new Date()

  const last12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { month: months[d.getMonth()], year: d.getFullYear(), Bookings: 0 }
  })

  hotels.forEach(hotel => {
    if (!Array.isArray(hotel.bookingHistory)) return
    hotel.bookingHistory.forEach(({ month, year, bookings }) => {
      const idx = last12.findIndex(m => m.month === month && m.year === year)
      if (idx !== -1) last12[idx].Bookings += bookings
    })
  })

  const data   = last12.map(m => ({ name: m.month, Bookings: m.Bookings }))
  const maxVal = Math.max(...data.map(d => d.Bookings), 1)

  return (
    <div style={{ ...glassStyle(p), padding: "20px 20px 12px", marginBottom: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#818cf8", fontWeight: 700, marginBottom: 2 }}>Trend</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 15, marginBottom: 18 }}>Bookings — Last 12 Months</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#818cf8" stopOpacity={dark ? 0.4 : 0.25} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={p.gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: p.tickFill }} axisLine={false} tickLine={false} domain={[0, maxVal + 1]} />
          <Tooltip content={<CustomTooltip dark={dark} />} />
          <Area type="monotone" dataKey="Bookings" stroke="#818cf8" strokeWidth={2.5} fill="url(#bookingGrad)"
            dot={{ r: 3.5, fill: "#818cf8", strokeWidth: 2, stroke: dark ? "#141828" : "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#818cf8" }} />
        </AreaChart>
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
    <div style={{ ...glassStyle(p), padding: "20px 20px 12px" }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#818cf8", fontWeight: 700, marginBottom: 2 }}>Mix</p>
      <h3 style={{ fontWeight: 700, color: p.text1, fontSize: 15, marginBottom: 18 }}>Category Distribution</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={42} paddingAngle={4} strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} contentStyle={p.tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2.5 flex-1">
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, backgroundColor: CAT_COLORS[i % CAT_COLORS.length], boxShadow: `0 0 6px ${CAT_COLORS[i % CAT_COLORS.length]}88` }} />
              <span style={{ fontSize: 13, color: p.text1, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[i % CAT_COLORS.length], background: `${CAT_COLORS[i % CAT_COLORS.length]}18`, padding: "1px 8px", borderRadius: 9999 }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Summary Card ──────────────────────────────────────────────
function SummaryCard({ label, value, icon, gradient, dark }) {
  const p = dp(dark)
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glassStyle(p),
        padding: 20,
        background: hovered ? p.glassHover : p.glass,
        boxShadow: hovered
          ? dark ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" : "0 8px 32px rgba(99,102,241,0.15)"
          : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative", overflow: "hidden", cursor: "default",
      }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: gradient, opacity: hovered ? 0.15 : 0.07, transition: "opacity 0.3s", pointerEvents: "none" }} />
      <p style={{ fontSize: 11, color: p.text3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: p.text1, marginBottom: 8, letterSpacing: "-0.02em" }}>{value}</p>
      <span style={{ fontSize: 22, opacity: 0.7 }}>{icon}</span>
    </div>
  )
}

// ── Hotel Card ────────────────────────────────────────────────
function HotelCard({ hotel, onDelete, onNavigate, dark }) {
  const p = dp(dark)
  const [hovered, setHovered]   = useState(false)
  const [delHover, setDelHover] = useState(false)
  const pending    = hotel.totalBookings - hotel.confirmedBookings - hotel.cancelledBookings
  const confirmPct = hotel.totalBookings ? Math.round((hotel.confirmedBookings / hotel.totalBookings) * 100) : 0

  const kpiTiles = [
    { label: "Total",     value: hotel.totalBookings,     color: p.text1,   bg: p.surface2,                    glow: null       },
    { label: "Confirmed", value: hotel.confirmedBookings, color: "#10b981", bg: "rgba(16,185,129,0.1)",         glow: "#10b981"  },
    { label: "Cancelled", value: hotel.cancelledBookings, color: "#f43f5e", bg: "rgba(244,63,94,0.1)",          glow: "#f43f5e"  },
    { label: "Revenue",   value: `₹${(hotel.revenue/1000).toFixed(0)}k`, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", glow: "#f59e0b" },
  ]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glassStyle(p),
        overflow: "hidden",
        background: hovered ? p.glassHover : p.glass,
        boxShadow: hovered
          ? dark ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(129,140,248,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 20px 60px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.15)"
          : dark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px) scale(1.005)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div style={{ display: "none", width: 3, background: hovered ? "linear-gradient(180deg, #818cf8, #6366f1, #4f46e5)" : "linear-gradient(180deg, #6366f1, #8b5cf6)", flexShrink: 0, transition: "background 0.3s", boxShadow: hovered ? "2px 0 12px rgba(99,102,241,0.4)" : "none" }} className="sm:block" />

        <div className="sm:w-32 h-44 sm:h-auto flex-shrink-0 relative overflow-hidden">
          {hotel.image ? (
            <img src={hotel.image} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: dark ? "linear-gradient(135deg, #1a1d2e, #252840)" : "linear-gradient(135deg, #f0f2ff, #e8ecff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 44, opacity: 0.35 }}>🏨</span>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s" }} />
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", color: "#4f46e5", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{hotel.type}</span>
        </div>

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 style={{ fontWeight: 800, color: p.text1, fontSize: 15, lineHeight: 1.3, letterSpacing: "-0.01em" }} className="truncate">{hotel.name}</h3>
                <TrendBadge value={hotel.bookingTrend} />
              </div>
              <p style={{ color: p.text3, fontSize: 12, marginTop: 3 }} className="truncate">📍 {hotel.location}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: p.text1 }}>₹{hotel.pricePerNight?.toLocaleString("en-IN")}</span>
              <span style={{ fontSize: 10, color: p.text3 }}>/night</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: 13, color: s <= Math.round(hotel.avgRating || 0) ? "#f59e0b" : dark ? "#2a2e47" : "#dde3ff", filter: s <= Math.round(hotel.avgRating || 0) ? "drop-shadow(0 0 3px #f59e0b88)" : "none" }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: p.text1 }}>{hotel.avgRating || "—"}</span>
              <span style={{ fontSize: 12, color: p.text3 }}>({hotel.reviewCount || 0})</span>
            </div>
            {hotel.occupancyRate != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 120 }}>
                <span style={{ fontSize: 11, color: p.text3, whiteSpace: "nowrap" }}>Occ.</span>
                <div style={{ flex: 1 }}><OccupancyStrip rate={hotel.occupancyRate} dark={dark} /></div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {kpiTiles.map((k, i) => (
              <div key={i}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                style={{ background: k.bg, borderRadius: 12, padding: "9px 6px", textAlign: "center", border: `1px solid ${k.glow ? k.glow + "30" : p.border}`, transition: "transform 0.2s" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: k.color, textShadow: k.glow ? `0 0 8px ${k.glow}66` : "none" }}>{k.value}</p>
                <p style={{ fontSize: 10, color: p.text3, marginTop: 2 }}>{k.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: p.text3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Confirm Rate</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>{confirmPct}%</span>
            </div>
            <div style={{ height: 5, background: p.surface2, borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 9999, width: `${confirmPct}%`, background: "linear-gradient(to right, #34d399, #10b981)", boxShadow: "0 0 8px rgba(16,185,129,0.5)", transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
            <button onClick={onNavigate} style={{ background: hovered ? "linear-gradient(135deg, #6366f1, #818cf8)" : dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", color: hovered ? "#fff" : "#818cf8", padding: "8px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.25s", boxShadow: hovered ? "0 4px 20px rgba(99,102,241,0.4)" : "none" }}>
              View Details →
            </button>
            <button onClick={onDelete}
              onMouseEnter={() => setDelHover(true)}
              onMouseLeave={() => setDelHover(false)}
              style={{ background: delHover ? "rgba(244,63,94,0.12)" : "transparent", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: delHover ? "0 4px 16px rgba(244,63,94,0.2)" : "none" }}>
              🗑 Delete
            </button>
            <div className="hidden sm:flex flex-col items-center ml-auto gap-1">
              <MiniPie confirmed={hotel.confirmedBookings} cancelled={hotel.cancelledBookings} pending={pending} dark={dark} />
              <p style={{ fontSize: 9, color: p.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ratio</p>
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
  const p        = dp(dark)

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`${API}/analytics/hotels`)
      setHotels(res.data)
    } catch {
      toast.error("Failed to load hotel analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHotels() }, [fetchHotels])

  const deleteHotel = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its data?`)) return
    try {
      await api.delete(`${API}/analytics/hotel/${id}`)
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
    { label: "Total Hotels",    value: hotels.length,                                       icon: "🏨", gradient: "radial-gradient(circle, #6366f1, transparent)" },
    { label: "Total Bookings",  value: hotels.reduce((s,h)=>s+h.totalBookings,0),           icon: "📋", gradient: "radial-gradient(circle, #10b981, transparent)" },
    { label: "Total Cancelled", value: hotels.reduce((s,h)=>s+h.cancelledBookings,0),       icon: "❌", gradient: "radial-gradient(circle, #f43f5e, transparent)" },
    { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`,          icon: "💰", gradient: "radial-gradient(circle, #f59e0b, transparent)" },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {summaryCards.map((s, i) => <SummaryCard key={i} dark={dark} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RevenueBarChart hotels={hotels} dark={dark} />
        <CategoryPieChart hotels={hotels} dark={dark} />
      </div>
      <BookingsTrendChart hotels={hotels} dark={dark} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <input
          placeholder="Search hotels…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...glassStyle(p, { padding: "10px 18px", fontSize: 14, flex: 1, minWidth: 144, outline: "none", color: p.text1 }) }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ ...glassStyle(p, { padding: "10px 18px", fontSize: 14, color: p.text1, outline: "none", cursor: "pointer" }) }}
        >
          <option value="bookings">Sort: Bookings</option>
          <option value="revenue">Sort: Revenue</option>
          <option value="rating">Sort: Rating</option>
          <option value="cancelled">Sort: Cancelled</option>
          <option value="occupancy">Sort: Occupancy</option>
        </select>
      </div>

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
          <div style={{ ...glassStyle(p), textAlign: "center", padding: "64px 0", color: p.text3 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🏨</p>
            <p style={{ fontSize: 14 }}>No hotels found</p>
          </div>
        )}
      </div>
    </div>
  )
}