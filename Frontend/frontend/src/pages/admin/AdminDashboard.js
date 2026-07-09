import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../../utils/auth";
import { toast } from "react-toastify";
import api from "../../services/apiClient";
import HotelAnalytics from "./HotelAnalytics";
import AdminOffers from "./AdminOffers";

import {
  StatCardsSkeleton,
  RequestsSkeleton,
  AdminHotelSkeleton,
  UsersSkeleton,
  BookingsSkeleton,
  AnalyticsSkeleton,
} from "../../component/Skeleton";

const API = "/api/admin";

/* ─── Dark mode hook ─────────────────────────────────────────────── */
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

/* ─── Dark mode CSS injected once ───────────────────────────────── */
const DARK_STYLE = `
  [data-admin-theme="dark"] {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #22263a;
    --border: #2e3347;
    --text-primary: #f0f2f8;
    --text-secondary: #8b90a7;
    --text-muted: #555c78;
    --shadow: 0 1px 4px rgba(0,0,0,0.35);
  }
  [data-admin-theme="light"] {
    --bg: #f3f4f6;
    --surface: #ffffff;
    --surface2: #f9fafb;
    --border: #e5e7eb;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
    --shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
`;

/* ─── Trend arrow helper ─────────────────────────────────────────── */
const TrendBadge = ({ value, suffix = "%" }) => {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 20,
        background: up ? "#dcfce7" : "#fee2e2",
        color: up ? "#15803d" : "#b91c1c",
      }}
    >
      {up ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M6 10l-4-4M6 10l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {Math.abs(value)}{suffix}
    </span>
  );
};

/* ─── Professional Stat Card ─────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, trend, trendLabel, suffix }) => {
  const borderColor = {
    "border-blue-500": "#3b82f6",
    "border-green-500": "#22c55e",
    "border-purple-500": "#a855f7",
    "border-orange-500": "#f97316",
    "border-yellow-500": "#eab308",
    "border-red-500": "#ef4444",
  }[color] || "#6b7280";

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: "20px 22px 16px",
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>{label}</p>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1 }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 22 }}>
        <TrendBadge value={trend} suffix={suffix || "%"} />
        {trendLabel && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{trendLabel}</span>
        )}
      </div>
    </div>
  );
};

/* ─── Search Bar ─────────────────────────────────────────────────── */
const SearchBar = ({ placeholder, value, onChange }) => (
  <div style={{ position: "relative", marginBottom: 16 }}>
    <svg
      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        paddingLeft: 38,
        paddingRight: 16,
        paddingTop: 9,
        paddingBottom: 9,
        borderRadius: 10,
        border: "1px solid var(--border)",
        fontSize: 14,
        color: "var(--text-primary)",
        background: "var(--surface2)",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  </div>
);

/* ─── Activity Feed Item ─────────────────────────────────────────── */
const ActivityItem = ({ icon, title, subtitle, time, badge, badgeColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%", background: "var(--surface2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, flexShrink: 0,
      }}
    >{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
          background: badgeColor?.bg || "var(--surface2)", color: badgeColor?.text || "var(--text-secondary)",
        }}>{badge}</span>
      )}
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{time}</span>
    </div>
  </div>
);

/* ─── Status colors ─────────────────────────────────────────────── */
const BADGE_COLORS = {
  user:       { bg: "#dbeafe", text: "#1d4ed8" },
  hotelOwner: { bg: "#f3e8ff", text: "#7e22ce" },
  admin:      { bg: "#fee2e2", text: "#b91c1c" },
  hotel:      { bg: "#dcfce7", text: "#15803d" },
  booking:    { bg: "#fef3c7", text: "#92400e" },
  pending:    { bg: "#fef3c7", text: "#92400e" },
  approved:   { bg: "#dcfce7", text: "#15803d" },
  rejected:   { bg: "#fee2e2", text: "#b91c1c" },
};

/* ─── Utility: relative time ─────────────────────────────────────── */
const relativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN");
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers]       = useState([]);
  const [hotels, setHotels]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [adminNote, setAdminNote] = useState({});
  const [tabLoading, setTabLoading]       = useState(false);
  const [statsLoading, setStatsLoading]   = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [dark, toggleDark] = useDarkMode();

  /* Search state */
  const [userSearch, setUserSearch]       = useState("");
  const [hotelSearch, setHotelSearch]     = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  const navigate = useNavigate();
  const user = getUser();

  /* Inject CSS once */
  useEffect(() => {
    let el = document.getElementById("admin-dark-style");
    if (!el) {
      el = document.createElement("style");
      el.id = "admin-dark-style";
      document.head.appendChild(el);
    }
    el.textContent = DARK_STYLE;
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get(`${API}/dashboard`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await api.get(`${API}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await api.get(`${API}/users`);
    setUsers(res.data);
  };

  const fetchHotels = async () => {
    const res = await api.get(`${API}/hotels`);
    setHotels(res.data);
  };

  const fetchBookings = async () => {
    const res = await api.get(`${API}/bookings`);
    setBookings(res.data);
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setTabLoading(true);
    try {
      if (tab === "users"    && users.length === 0)    await fetchUsers();
      else if (tab === "hotels"   && hotels.length === 0)   await fetchHotels();
      else if (tab === "bookings" && bookings.length === 0)  await fetchBookings();
    } finally {
      setTabLoading(false);
    }
  };

  const resolveRequest = async (id, status) => {
    try {
      await api.patch(
        `${API}/requests/${id}`,
        { status, adminNote: adminNote[id] || "" }
      );
      toast.success(`Request ${status} ✅`);
      fetchRequests();
      fetchStats();
    } catch {
      toast.error("Failed to resolve request");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`${API}/users/${id}`);
    toast.success("User deleted");
    fetchUsers();
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/", { replace: true });
  };

  /* ── Filtered lists ─────────────────────────────────────────────── */
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredHotels = hotels.filter(
    (h) =>
      h.name?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
      h.district?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
      h.state?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
      h.type?.toLowerCase().includes(hotelSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.hotelName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.email?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  /* ── Build activity feed ─────────────────────────────────────────── */
  const buildActivityFeed = () => {
    const items = [];
    bookings.slice(0, 3).forEach((b) => {
      items.push({
        icon: "📋",
        title: `New booking — ${b.hotelName}`,
        subtitle: `${b.name} · ${b.email}`,
        time: relativeTime(b.createdAt || b.checkIn),
        badge: `₹${b.totalPrice?.toLocaleString()}`,
        badgeColor: BADGE_COLORS.booking,
        _date: new Date(b.createdAt || b.checkIn),
      });
    });
    users.slice(0, 3).forEach((u) => {
      items.push({
        icon: u.role === "hotelOwner" ? "🏢" : "👤",
        title: `${u.role === "hotelOwner" ? "Hotel owner" : "User"} joined — ${u.name}`,
        subtitle: u.email,
        time: relativeTime(u.createdAt),
        badge: u.role,
        badgeColor: BADGE_COLORS[u.role] || BADGE_COLORS.user,
        _date: new Date(u.createdAt),
      });
    });
    hotels.slice(0, 2).forEach((h) => {
      items.push({
        icon: "🏨",
        title: `Hotel listed — ${h.name}`,
        subtitle: `${h.district}, ${h.state} · ₹${h.pricePerNight}/night`,
        time: relativeTime(h.createdAt),
        badge: h.type,
        badgeColor: BADGE_COLORS.hotel,
        _date: new Date(h.createdAt),
      });
    });
    requests.slice(0, 3).forEach((r) => {
      items.push({
        icon: "📝",
        title: `Request — ${r.type?.replace(/_/g, " ")}`,
        subtitle: `${r.ownerName} · ${r.reason}`,
        time: relativeTime(r.createdAt),
        badge: r.status,
        badgeColor: BADGE_COLORS[r.status] || BADGE_COLORS.pending,
        _date: new Date(r.createdAt),
      });
    });
    return items
      .filter((i) => !isNaN(i._date))
      .sort((a, b) => b._date - a._date)
      .slice(0, 8);
  };

  const getTrend = (key) => {
    const mockTrends = {
      totalHotels: 8, totalUsers: 12, totalOwners: 5,
      totalBookings: 18, totalRevenue: 22, pendingRequests: null,
    };
    return stats?.[`${key}Growth`] ?? mockTrends[key] ?? null;
  };

  const TABS = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "requests",  label: `📝 Requests${stats?.pendingRequests > 0 ? ` (${stats.pendingRequests})` : ""}` },
    { key: "hotels",    label: "🏨 Hotels" },
    { key: "users",     label: "👥 Users" },
    { key: "bookings",  label: "📋 Bookings" },
    { key: "offers",    label: "🎟️ Offers" },   // NEW
    { key: "analytics", label: "📈 Analytics" },
  ];

  /* ── Dark-mode-aware class helpers ──────────────────────────────── */
  const dm = {
    page:        dark ? "bg-[#0f1117] min-h-screen" : "min-h-screen bg-gray-50",
    header:      dark ? "bg-[#1a1d27] border-b border-[#2e3347] px-6 py-4 flex items-center justify-between" : "bg-white shadow-sm px-6 py-4 flex items-center justify-between",
    headerH1:    dark ? "text-xl font-bold text-gray-100" : "text-xl font-bold text-gray-800",
    headerSub:   dark ? "text-sm text-gray-400" : "text-sm text-gray-500",
    tabBar:      dark ? "bg-[#1a1d27] border-b border-[#2e3347] px-6" : "bg-white border-b px-6",
    tabBtn:      (active) => active
      ? "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition border-blue-500 text-blue-400"
      : dark
        ? "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition border-transparent text-gray-500 hover:text-gray-300"
        : "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition border-transparent text-gray-500 hover:text-gray-700",
    card:        dark ? "bg-[#1a1d27] rounded-2xl shadow-sm border border-[#2e3347] p-5" : "bg-white rounded-2xl shadow-sm p-5",
    text1:       dark ? "text-gray-100" : "text-gray-800",
    text2:       dark ? "text-gray-400" : "text-gray-500",
    text3:       dark ? "text-gray-500" : "text-gray-400",
    filterBtn:   dark ? "px-3 py-1.5 rounded-lg text-sm border border-[#2e3347] hover:bg-[#22263a] transition capitalize text-gray-300" : "px-3 py-1.5 rounded-lg text-sm border hover:bg-gray-50 transition capitalize",
    textarea:    dark ? "border border-[#2e3347] bg-[#22263a] text-gray-200 rounded-lg p-2 text-xs resize-none w-full" : "border rounded-lg p-2 text-xs resize-none w-full",
    hotelType:   dark ? "bg-blue-900/30 text-blue-300 text-xs px-3 py-1 rounded-full" : "bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full",
    userRole:    (role) => role === "admin"
      ? dark ? "text-xs px-2 py-1 rounded-full font-medium bg-red-900/30 text-red-400" : "text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-600"
      : role === "hotelOwner"
        ? dark ? "text-xs px-2 py-1 rounded-full font-medium bg-purple-900/30 text-purple-400" : "text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-600"
        : dark ? "text-xs px-2 py-1 rounded-full font-medium bg-gray-700 text-gray-300" : "text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600",
    statusBadge: (s) => ({
      pending:  dark ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-700",
      approved: dark ? "bg-green-900/40 text-green-300"  : "bg-green-100 text-green-700",
      rejected: dark ? "bg-red-900/40 text-red-300"      : "bg-red-100 text-red-600",
    }[s] || ""),
  };

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className={dm.page} data-admin-theme={dark ? "dark" : "light"}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className={dm.header}>
        <div>
          <h1 className={dm.headerH1}>🔐 Admin Panel</h1>
          <p className={dm.headerSub}>SafarSetu Administration · {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition text-lg ${
              dark ? "bg-[#22263a] hover:bg-[#2e3347] text-yellow-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={handleLogout}
            className={dark
              ? "bg-red-900/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-900/50 transition"
              : "bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className={dm.tabBar}>
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)} className={dm.tabBtn(activeTab === t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ══ Dashboard Tab ════════════════════════════════════════ */}
        {activeTab === "dashboard" && (statsLoading ? <StatCardsSkeleton /> : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard icon="🏨" label="Total Hotels"      value={stats?.totalHotels || 0}                              color="border-blue-500"   trend={getTrend("totalHotels")}    trendLabel="vs last month" />
              <StatCard icon="👥" label="Total Users"       value={stats?.totalUsers || 0}                               color="border-green-500"  trend={getTrend("totalUsers")}     trendLabel="vs last month" />
              <StatCard icon="🏢" label="Hotel Owners"      value={stats?.totalOwners || 0}                              color="border-purple-500" trend={getTrend("totalOwners")}    trendLabel="vs last month" />
              <StatCard icon="📋" label="Total Bookings"    value={stats?.totalBookings || 0}                            color="border-orange-500" trend={getTrend("totalBookings")}  trendLabel="vs last month" />
              <StatCard icon="💰" label="Platform Revenue"  value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}     color="border-yellow-500" trend={getTrend("totalRevenue")}   trendLabel="vs last month" />
              <StatCard icon="⏳" label="Pending Requests"  value={stats?.pendingRequests || 0}                          color="border-red-500"    trend={null} trendLabel="" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {stats?.recentRequests?.length > 0 && (
                <div style={{ background: "var(--surface)", borderRadius: 16, padding: "20px 20px 12px", boxShadow: "var(--shadow)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>⚡ Pending Requests</h3>
                    <button onClick={() => handleTabChange("requests")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, cursor: "pointer", padding: 0 }}>
                      View all →
                    </button>
                  </div>
                  {stats.recentRequests.map((r) => (
                    <div key={r._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, marginBottom: 8, gap: 8, border: "1px solid var(--border)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.ownerName} — {r.type.replace(/_/g, " ")}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{r.reason}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 12, background: "#fef3c7", color: "#92400e", flexShrink: 0 }}>
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: "var(--surface)", borderRadius: 16, padding: "20px 20px 12px", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>🕐 Recent Activity</h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface2)", padding: "2px 8px", borderRadius: 8 }}>Live</span>
                </div>
                {buildActivityFeed().length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "24px 0" }}>
                    No recent activity yet.<br />
                    <span style={{ fontSize: 11 }}>Activity appears as users, hotels &amp; bookings are added.</span>
                  </p>
                ) : (
                  buildActivityFeed().map((item, i) => <ActivityItem key={i} {...item} />)
                )}
              </div>
            </div>
          </>
        ))}

        {/* ══ Requests Tab ═══════════════════════════════════════ */}
        {activeTab === "requests" && (tabLoading || requestsLoading ? <RequestsSkeleton /> : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {["", "pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={async () => {
                    const res = await api.get(`${API}/requests${s ? `?status=${s}` : ""}`);
                    setRequests(res.data);
                  }}
                  className={dm.filterBtn}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            {requests.length === 0 ? (
              <div className={`text-center py-12 ${dm.text3}`}>
                <p className="text-4xl mb-3">📭</p>
                <p>No requests found</p>
              </div>
            ) : requests.map((r) => (
              <div key={r._id} className={`${dark ? "bg-[#1a1d27] border border-[#2e3347]" : "bg-white"} rounded-2xl shadow-sm p-4 sm:p-5`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className={`font-bold text-sm sm:text-base ${dm.text1}`}>{r.type.replace(/_/g, " ").toUpperCase()}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${dm.statusBadge(r.status)}`}>{r.status}</span>
                    </div>
                    <p className={`text-sm ${dm.text2}`}>
                      From: <span className="font-medium">{r.ownerName}</span>
                      <span className={`block sm:inline sm:ml-1 text-xs ${dm.text3}`}>({r.ownerEmail})</span>
                    </p>
                    <p className={`text-sm mt-1 break-words ${dm.text2}`}>{r.reason}</p>
                    {r.details && Object.keys(r.details).length > 0 && (
                      <div className={`mt-2 ${dark ? "bg-[#22263a]" : "bg-gray-50"} rounded-xl p-3`}>
                        <p className={`text-xs font-medium mb-1 ${dm.text3}`}>Request Details:</p>
                        {Object.entries(r.details).map(([k, v]) => (
                          <p key={k} className={`text-xs break-words ${dm.text2}`}>{k}: <span className="font-medium">{String(v)}</span></p>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${dm.text3}`}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex flex-col gap-2 w-full sm:w-48 sm:flex-shrink-0">
                      <textarea
                        placeholder="Admin note (optional)"
                        rows={2}
                        onChange={(e) => setAdminNote({ ...adminNote, [r._id]: e.target.value })}
                        className={dm.textarea}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => resolveRequest(r._id, "approved")} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">✅ Approve</button>
                        <button onClick={() => resolveRequest(r._id, "rejected")} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">❌ Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* ══ Hotels Tab ════════════════════════════════════════════ */}
        {activeTab === "hotels" && (tabLoading ? <AdminHotelSkeleton /> : (
          <div className="space-y-3">
            <SearchBar placeholder="Search hotels by name, city, state or type…" value={hotelSearch} onChange={setHotelSearch} />
            {filteredHotels.length === 0 && (
              <div className={`text-center py-12 ${dm.text3}`}>
                <p className="text-4xl mb-3">🏨</p>
                <p>No hotels match your search</p>
              </div>
            )}
            {filteredHotels.map((h) => (
              <div key={h._id} className={`${dark ? "bg-[#1a1d27] border border-[#2e3347]" : "bg-white"} rounded-2xl shadow-sm p-5 flex items-center justify-between`}>
                <div>
                  <p className={`font-bold ${dm.text1}`}>{h.name}</p>
                  <p className={`text-sm ${dm.text2}`}>{h.district}, {h.state}</p>
                  <p className={`text-xs mt-1 ${dm.text3}`}>₹{h.pricePerNight}/night · {h.rooms} rooms · ⭐{h.averageRating?.toFixed(1)}</p>
                </div>
                <span className={dm.hotelType}>{h.type}</span>
              </div>
            ))}
          </div>
        ))}

        {/* ══ Users Tab ═════════════════════════════════════════════ */}
        {activeTab === "users" && (tabLoading ? <UsersSkeleton /> : (
          <div className="space-y-3">
            <SearchBar placeholder="Search users by name, email or role…" value={userSearch} onChange={setUserSearch} />
            {filteredUsers.length === 0 && (
              <div className={`text-center py-12 ${dm.text3}`}>
                <p className="text-4xl mb-3">👥</p>
                <p>No users match your search</p>
              </div>
            )}
            {filteredUsers.map((u) => (
              <div key={u._id} className={`${dark ? "bg-[#1a1d27] border border-[#2e3347]" : "bg-white"} rounded-2xl shadow-sm p-4 flex items-center justify-between`}>
                <div>
                  <p className={`font-medium ${dm.text1}`}>{u.name}</p>
                  <p className={`text-sm ${dm.text2}`}>{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={dm.userRole(u.role)}>{u.role}</span>
                  {u.role !== "admin" && (
                    <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-500 text-sm transition">🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* ══ Bookings Tab ══════════════════════════════════════════ */}
        {activeTab === "bookings" && (tabLoading ? <BookingsSkeleton /> : (
          <div className="space-y-3">
            <SearchBar placeholder="Search bookings by hotel, guest name or email…" value={bookingSearch} onChange={setBookingSearch} />
            {filteredBookings.length === 0 && (
              <div className={`text-center py-12 ${dm.text3}`}>
                <p className="text-4xl mb-3">📋</p>
                <p>No bookings match your search</p>
              </div>
            )}
            {filteredBookings.map((b) => (
              <div key={b._id} className={`${dark ? "bg-[#1a1d27] border border-[#2e3347]" : "bg-white"} rounded-2xl shadow-sm p-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-bold ${dm.text1}`}>{b.hotelName}</p>
                    <p className={`text-sm ${dm.text2}`}>{b.name} · {b.email}</p>
                    <p className={`text-xs mt-1 ${dm.text3}`}>
                      {new Date(b.checkIn).toLocaleDateString("en-IN")} → {new Date(b.checkOut).toLocaleDateString("en-IN")} · {b.nights} nights · {b.rooms} rooms
                    </p>
                    <span className={dark
                      ? "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-xs font-medium"
                      : "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium"
                    }>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Booked on {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="font-bold text-green-500">₹{b.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
        {activeTab === "offers" && <AdminOffers dark={dark} />}


        {/* ══ Analytics Tab ═════════════════════════════════════════ */}
        {activeTab === "analytics" && (tabLoading ? <AnalyticsSkeleton /> : <HotelAnalytics dark={dark} />)}
      </div>
    </div>
  );
}

export default AdminDashboard;