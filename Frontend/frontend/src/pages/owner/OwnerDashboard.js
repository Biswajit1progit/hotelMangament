// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerDashboard.jsx
// Production-grade UI · dark mode · matches admin theme · Mobile-responsive
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUser } from "../../utils/auth";
import ContactForm from "../../component/ContactForm";
import Footer from "../../component/footer";

const API = `${process.env.REACT_APP_API_URL}/api/owners`;

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

const dp = (dark) => ({
  pageBg:   dark ? "#0f1117" : "#f0f4f8",
  surface:  dark ? "#1a1d27" : "#ffffff",
  surface2: dark ? "#22263a" : "#f8fafc",
  surface3: dark ? "#2a2f45" : "#f1f5f9",
  border:   dark ? "#2e3347" : "#e2e8f0",
  text1:    dark ? "#f0f2f8" : "#0f172a",
  text2:    dark ? "#8b90a7" : "#64748b",
  text3:    dark ? "#555c78" : "#94a3b8",
  accent:   "#3b82f6",
  accentBg: dark ? "#1e3a5f" : "#eff6ff",
  green:    "#10b981",
  greenBg:  dark ? "#0d2e23" : "#ecfdf5",
  amber:    "#f59e0b",
  amberBg:  dark ? "#2a1f08" : "#fffbeb",
  red:      "#f43f5e",
  redBg:    dark ? "#2e1020" : "#fff1f2",
  purple:   "#8b5cf6",
  purpleBg: dark ? "#1e1240" : "#f5f3ff",
  shadow:   dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.08)",
});

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');

  .owner-dash, .owner-dash * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .owner-dash .mono { font-family: 'DM Mono', monospace; }

  .owner-dash .stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .owner-dash .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; }

  .owner-dash .booking-row { transition: background 0.14s ease; }

  .owner-dash .nav-btn { transition: opacity 0.14s ease, transform 0.12s ease; }
  .owner-dash .nav-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .owner-dash .nav-btn:active { transform: translateY(0); }

  .owner-dash .action-btn { transition: transform 0.14s ease, box-shadow 0.14s ease; }
  .owner-dash .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }

  .owner-dash .pulse-dot {
    display: inline-block; width: 6px; height: 6px;
    border-radius: 50%; background: #f43f5e;
    animation: o-pulse 1.6s ease-in-out infinite;
  }
  @keyframes o-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(1.4); }
  }

  .owner-dash .badge {
    display: inline-flex; align-items: center;
    font-size: 11px; font-weight: 600;
    padding: 2px 9px; border-radius: 20px;
    letter-spacing: 0.02em;
  }

  .owner-dash .section-card { border-radius: 18px; }
  .owner-dash .progress-bar { height: 6px; border-radius: 99px; overflow: hidden; }

  .owner-dash .toggle-track {
    width: 40px; height: 22px; border-radius: 99px;
    position: relative; cursor: pointer;
    transition: background 0.22s ease;
    border: none; padding: 0; flex-shrink: 0;
    display: flex; align-items: center;
  }
  .owner-dash .toggle-thumb {
    position: absolute; top: 3px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; transition: left 0.22s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.28);
  }

  /* ── Responsive ─────────────────────────────────────────── */

  /* Two-col panels → single col */
  @media (max-width: 700px) {
    .owner-two-col { grid-template-columns: 1fr !important; }
  }

  /* Stat grid: 2 cols on mobile */
  @media (max-width: 600px) {
    .owner-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  /* Header: wrap brand + buttons to two rows on mobile */
  @media (max-width: 600px) {
    .owner-header { flex-wrap: wrap; gap: 10px !important; padding: 12px 16px !important; }
    .owner-header-actions { width: 100%; justify-content: space-between !important; }
    .owner-header-actions .nav-btn { flex: 1; justify-content: center !important; }
  }

  /* Banner: stack vertically on mobile */
  @media (max-width: 520px) {
    .owner-banner { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
    .owner-banner-occ { align-self: flex-start !important; }
  }

  /* Page padding: tighter on mobile */
  @media (max-width: 600px) {
    .owner-page-inner { padding: 16px 12px !important; }
  }

  /* Booking row: tighter on mobile */
  @media (max-width: 480px) {
    .booking-row-inner { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
    .booking-row-right { align-self: flex-end !important; }
  }

  /* Warning banner: stack on mobile */
  @media (max-width: 480px) {
    .owner-warn-banner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .owner-warn-btn { align-self: stretch !important; text-align: center !important; }
  }
`;

/* ─── Shimmer ─────────────────────────────────────────────────── */
function Shimmer({ dark }) {
  const p = dp(dark);
  const box = { background: dark ? "#22263a" : "#e2e8f0", borderRadius: 8 };
  return (
    <div className="owner-dash" style={{ minHeight: "100vh", background: p.pageBg }}>
      <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <div style={{ ...box, width: 180, height: 18 }} />
          <div style={{ ...box, width: 120, height: 12 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[90, 90, 40, 72].map((w, i) => <div key={i} style={{ ...box, width: w, height: 36, borderRadius: 10 }} />)}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ ...box, height: 88, borderRadius: 18, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ ...box, height: 110, borderRadius: 18 }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[...Array(2)].map((_, i) => <div key={i} style={{ ...box, height: 240, borderRadius: 18 }} />)}
        </div>
        <div style={{ background: p.surface, borderRadius: 18, padding: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ ...box, height: 68, borderRadius: 14, marginBottom: 10 }} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent, accentBg, border, surface, text1, text2, sub }) {
  return (
    <div
      className="stat-card section-card"
      style={{
        background: surface,
        padding: "16px 16px 14px",
        borderTop: `1px solid ${border}`,
        borderRight: `1px solid ${border}`,
        borderBottom: `1px solid ${border}`,
        borderLeft: `4px solid ${accent}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: accentBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {icon}
        </div>
        <span className="badge" style={{ background: accentBg, color: accent }}>Live</span>
      </div>
      <div>
        <p style={{ fontSize: 11, color: text2, fontWeight: 500, marginBottom: 4, letterSpacing: "0.01em" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: text1, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p style={{ fontSize: 10, color: text2, marginTop: 6, lineHeight: 1.4 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Occupancy Bar ───────────────────────────────────────────── */
function OccupancyBar({ occupied, total, dark }) {
  const p = dp(dark);
  const pct = total ? Math.round((occupied / total) * 100) : 0;
  const color = pct >= 80 ? "#f43f5e" : pct >= 50 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 12, color: p.text2, fontWeight: 500 }}>Occupancy Rate</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div className="progress-bar" style={{ background: p.surface3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(to right, ${color}bb, ${color})`, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

/* ─── Insight Row ─────────────────────────────────────────────── */
function InsightRow({ icon, label, value, dark, last }) {
  const p = dp(dark);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: last ? "none" : `1px solid ${p.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{icon}</span>
        <span style={{ fontSize: 13, color: p.text2, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: p.text1 }}>{value}</span>
    </div>
  );
}

/* ─── Booking Row ─────────────────────────────────────────────── */
function BookingRow({ b, dark }) {
  const p = dp(dark);
  const hue = ((b.name?.charCodeAt(0) || 65) * 7) % 360;
  return (
    <div
      className="booking-row"
      style={{
        padding: "13px 14px", borderRadius: 14, gap: 12,
        background: p.surface2, marginBottom: 8, cursor: "default",
      }}
      onMouseEnter={e => e.currentTarget.style.background = p.surface3}
      onMouseLeave={e => e.currentTarget.style.background = p.surface2}
    >
      <div
        className="booking-row-inner"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0, alignItems: "center" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: `hsl(${hue}, 55%, ${dark ? 26 : 90}%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800,
            color: `hsl(${hue}, 60%, ${dark ? 72 : 36}%)`,
          }}>
            {b.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: p.text1, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</p>
            <p style={{ fontSize: 11, color: p.text3, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.email}</p>
            <p style={{ fontSize: 11, color: p.text2 }}>
              {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {" → "}
              {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
        <div className="booking-row-right" style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#10b981", marginBottom: 5 }}>₹{b.totalPrice?.toLocaleString("en-IN")}</p>
          <span className="badge" style={{ background: dp(dark).greenBg, color: "#10b981" }}>
            {b.rooms} rm · {b.nights || 1} nt
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
function OwnerDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, toggleDark]    = useDarkMode();
  const navigate              = useNavigate();
  const user                  = getUser();
  const p                     = dp(dark);

  useEffect(() => {
    let el = document.getElementById("owner-dash-style");
    if (!el) { el = document.createElement("style"); el.id = "owner-dash-style"; document.head.appendChild(el); }
    el.textContent = STYLES;
  }, []);

  useEffect(() => { fetchStats(); }, []);

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

  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };

  if (loading) return <Shimmer dark={dark} />;

  const occupiedPct = stats?.totalRooms
    ? Math.round(((stats.occupiedRooms || 0) / stats.totalRooms) * 100) : 0;

  const avgRevPerBooking = stats?.totalBookings
    ? Math.round((stats.totalRevenue || 0) / stats.totalBookings) : 0;

  return (
    <div className="owner-dash" style={{ minHeight: "100vh", background: p.pageBg }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="owner-header"
        style={{
          background: p.surface, borderBottom: `1px solid ${p.border}`,
          padding: "14px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          position: "sticky", top: 0, zIndex: 40,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🏨</div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: p.text1, margin: 0, letterSpacing: "-0.01em" }}>Owner Dashboard</h1>
            <p style={{ fontSize: 12, color: p.text3, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="owner-header-actions"
          style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}
        >
          <button
            className="nav-btn"
            onClick={() => navigate("/owner/bookings")}
            style={{ background: p.accentBg, color: p.accent, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            📋 <span className="nav-btn-label">Bookings</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => navigate("/owner/requests")}
            style={{ background: p.amberBg, color: p.amber, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, position: "relative" }}
          >
            📝 <span className="nav-btn-label">Requests</span>
            {stats?.pendingRequests > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: p.red, color: "#fff",
                fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 18, height: 18,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 3, padding: "0 5px",
              }}>
                <span className="pulse-dot" />
                {stats.pendingRequests}
              </span>
            )}
          </button>

          <button
            className="toggle-track"
            onClick={toggleDark}
            title={dark ? "Switch to light" : "Switch to dark"}
            style={{ background: dark ? "#3b82f6" : "#cbd5e1" }}
          >
            <div className="toggle-thumb" style={{ left: dark ? 21 : 3 }} />
          </button>

          <button
            className="nav-btn"
            onClick={handleLogout}
            style={{ background: p.red, color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ── Page Body ─────────────────────────────────────────── */}
      <div
        className="owner-page-inner"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}
      >

        {/* ── Hotel Banner ───────────────────────────────────── */}
        {stats?.hotelName ? (
          <div
            className="owner-banner"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 55%, #7c3aed 100%)",
              borderRadius: 20, padding: "22px 24px", marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 80, bottom: -70, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 7 }}>Your Property</p>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stats.hotelName}</h2>
              {stats?.hotelLocation && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 7 }}>📍 {stats.hotelLocation}</p>
              )}
            </div>
            <div
              className="owner-banner-occ"
              style={{
                position: "relative", zIndex: 1, background: "rgba(255,255,255,0.13)",
                borderRadius: 16, padding: "12px 20px", textAlign: "center", flexShrink: 0,
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 5 }}>Occupancy</p>
              <p style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1, margin: 0, fontFamily: "'DM Mono', monospace" }}>{occupiedPct}%</p>
            </div>
          </div>
        ) : (
          <div
            className="owner-warn-banner"
            style={{
              background: p.amberBg,
              borderTop: `1px solid ${dark ? "#4a3010" : "#fde68a"}`,
              borderRight: `1px solid ${dark ? "#4a3010" : "#fde68a"}`,
              borderBottom: `1px solid ${dark ? "#4a3010" : "#fde68a"}`,
              borderLeft: `4px solid ${p.amber}`,
              borderRadius: 18, padding: "18px 20px", marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}
          >
            <div>
              <p style={{ fontWeight: 700, color: dark ? "#fde68a" : "#92400e", fontSize: 14, marginBottom: 4 }}>⚠️ No hotel listed yet</p>
              <p style={{ fontSize: 12, color: dark ? "#d97706" : "#b45309" }}>Submit a request to admin to get your property listed on SafarSetu</p>
            </div>
            <button
              className="action-btn owner-warn-btn"
              onClick={() => navigate("/owner/requests")}
              style={{ background: p.amber, color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              + Add Hotel
            </button>
          </div>
        )}

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div
          className="owner-stat-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 24 }}
        >
          <StatCard icon="📋" label="Total Bookings"   value={stats?.totalBookings || 0}                                accent="#3b82f6" accentBg={p.accentBg} border={p.border} surface={p.surface} text1={p.text1} text2={p.text2} sub="All time" />
          <StatCard icon="💰" label="Total Revenue"    value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`}  accent="#10b981" accentBg={p.greenBg}  border={p.border} surface={p.surface} text1={p.text1} text2={p.text2} sub={`Avg ₹${avgRevPerBooking.toLocaleString("en-IN")} / booking`} />
          <StatCard icon="🛏️" label="Occupied Rooms"   value={`${stats?.occupiedRooms || 0} / ${stats?.totalRooms || 0}`} accent="#f59e0b" accentBg={p.amberBg}  border={p.border} surface={p.surface} text1={p.text1} text2={p.text2} sub={`${occupiedPct}% occupancy`} />
          <StatCard icon="✅" label="Available Rooms"  value={stats?.availableRooms || 0}                                accent="#8b5cf6" accentBg={p.purpleBg} border={p.border} surface={p.surface} text1={p.text1} text2={p.text2} sub="Ready to book" />
        </div>

        {/* ── Two-column ─────────────────────────────────────── */}
        <div className="owner-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Quick Insights */}
          <div className="section-card" style={{ background: p.surface, padding: "20px", border: `1px solid ${p.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: p.text1, margin: 0 }}>Quick Insights</h3>
            </div>
            <OccupancyBar occupied={stats?.occupiedRooms || 0} total={stats?.totalRooms || 0} dark={dark} />
            <div style={{ marginTop: 10 }}>
              <InsightRow icon="💰" label="Avg Revenue / Booking" value={`₹${avgRevPerBooking.toLocaleString("en-IN")}`} dark={dark} />
              <InsightRow icon="🛏️" label="Total Rooms"           value={stats?.totalRooms || 0} dark={dark} />
              <InsightRow icon="✅" label="Available Now"          value={stats?.availableRooms || 0} dark={dark} />
              <InsightRow icon="📝" label="Pending Requests"       value={stats?.pendingRequests || 0} dark={dark} />
              <InsightRow icon="📊" label="Booking Fill Rate"      value={`${occupiedPct}%`} dark={dark} last />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section-card" style={{ background: p.surface, padding: "20px", border: `1px solid ${p.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>🚀</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: p.text1, margin: 0 }}>Quick Actions</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "📋", label: "View All Bookings",  sub: "Browse & manage reservations",  bg: p.accentBg, color: p.accent, path: "/owner/bookings" },
                { icon: "📝", label: "Manage Requests",    sub: "Submit or track hotel requests", bg: p.amberBg,  color: p.amber,  path: "/owner/requests" },
              ].map((a, i) => (
                <button
                  key={i}
                  className="action-btn"
                  onClick={() => navigate(a.path)}
                  style={{ display: "flex", alignItems: "center", gap: 14, background: a.bg, borderRadius: 14, padding: "14px 16px", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: a.color, margin: 0 }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: p.text3, margin: "2px 0 0" }}>{a.sub}</p>
                  </div>
                  <span style={{ marginLeft: "auto", color: a.color, fontSize: 16, flexShrink: 0 }}>→</span>
                </button>
              ))}

              {/* Revenue pill */}
              <div style={{
                marginTop: 4,
                background: dark ? "linear-gradient(135deg, #0d2e23, #091f18)" : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                borderRadius: 14, padding: "16px 18px",
                border: `1px solid ${dark ? "#134e35" : "#a7f3d0"}`,
              }}>
                <p style={{ fontSize: 11, color: p.green, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Total Earned</p>
                <p className="mono" style={{ fontSize: 22, fontWeight: 800, color: p.green, margin: 0 }}>
                  ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
                </p>
                <p style={{ fontSize: 11, color: dark ? "#4ade80" : "#059669", marginTop: 5 }}>
                  from {stats?.totalBookings || 0} booking{stats?.totalBookings !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Bookings ────────────────────────────────── */}
        <div className="section-card" style={{ background: p.surface, padding: "20px 20px", border: `1px solid ${p.border}`, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🕐</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: p.text1, margin: 0 }}>Recent Bookings</h3>
              {stats?.recentBookings?.length > 0 && (
                <span className="badge" style={{ background: p.accentBg, color: p.accent }}>{stats.recentBookings.length} latest</span>
              )}
            </div>
            <button
              onClick={() => navigate("/owner/bookings")}
              style={{ color: p.accent, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              View all →
            </button>
          </div>

          {!stats?.recentBookings?.length ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: p.text3 }}>
              <p style={{ fontSize: 38, marginBottom: 10 }}>📭</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: p.text2, marginBottom: 4 }}>No bookings yet</p>
              <p style={{ fontSize: 12 }}>Bookings will appear here once guests reserve your property</p>
            </div>
          ) : (
            stats.recentBookings.map((b) => <BookingRow key={b._id} b={b} dark={dark} />)
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default OwnerDashboard;