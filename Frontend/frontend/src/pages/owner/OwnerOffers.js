// ─────────────────────────────────────────────────────────────
// frontend/src/pages/owner/OwnerOffers.jsx
// Matches OwnerDashboard's inline-style dark/light theme system
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../../utils/auth";
import api from "../../services/apiClient";
import {
  getOwnerOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../../services/Offerservice";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("admin-dark") === "true"; } catch { return false; }
  });
  return [dark];
}

const dp = (dark) => ({
  pageBg:   dark ? "#0f1117" : "#f0f4f8",
  surface:  dark ? "#1a1d27" : "#ffffff",
  surface2: dark ? "#22263a" : "#f8fafc",
  border:   dark ? "#2e3347" : "#e2e8f0",
  text1:    dark ? "#f0f2f8" : "#0f172a",
  text2:    dark ? "#8b90a7" : "#64748b",
  text3:    dark ? "#555c78" : "#94a3b8",
  accent:   "#3b82f6",
  accentBg: dark ? "#1e3a5f" : "#eff6ff",
  green:    "#10b981",
  greenBg:  dark ? "#0d2e23" : "#ecfdf5",
  red:      "#f43f5e",
  redBg:    dark ? "#2e1020" : "#fff1f2",
});

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: "flat",
  value: "",
  maxDiscountAmount: "",
  minBookingAmount: "",
  applicableMethods: ["any"],
  validFrom: "",
  validTill: "",
  usageLimit: "",
  perUserLimit: 1,
};

const METHOD_OPTIONS = ["any", "card", "upi", "netbanking", "wallet"];

function OwnerOffers() {
  const [dark] = useDarkMode();
  const p = dp(dark);
  const navigate = useNavigate();
  const user = getUser();

  const [offers, setOffers] = useState([]);
  const [myHotels, setMyHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchOffers();
    fetchMyHotels();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getOwnerOffers();
      setOffers(data);
    } catch (err) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const [loadingHotel, setLoadingHotel] = useState(true);

  const fetchMyHotels = async () => {
    try {
      setLoadingHotel(true);
      // Calls ownerController.getMyHotel — returns the full Hotel doc,
      // which is where the real _id actually lives (dashboard stats
      // only return hotelName, never an id).
      const res = await api.get("/api/owners/hotel");
      const hotel = res.data;

      if (hotel?._id) {
        setMyHotels([{ _id: hotel._id, name: hotel.name }]);
        setSelectedHotel(hotel._id);
      } else {
        toast.error("Could not find your hotel — contact support if this persists");
        console.warn("OwnerOffers: unexpected /api/owners/hotel response:", hotel);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("No hotel listed under your account yet");
      } else {
        console.error(err);
        toast.error("Failed to load your hotel");
      }
    } finally {
      setLoadingHotel(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleMethodToggle = (method) => {
    setForm((prev) => {
      if (method === "any") return { ...prev, applicableMethods: ["any"] };
      const withoutAny = prev.applicableMethods.filter((m) => m !== "any");
      const has = withoutAny.includes(method);
      const next = has ? withoutAny.filter((m) => m !== method) : [...withoutAny, method];
      return { ...prev, applicableMethods: next.length ? next : ["any"] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotel) {
      toast.error("No hotel found for your account");
      return;
    }
    try {
      const payload = {
        ...form,
        scope: "hotel",
        hotel: selectedHotel,
        value: Number(form.value),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
      };

      if (editingId) {
        await updateOffer(editingId, payload);
        toast.success("Offer updated ✅");
      } else {
        await createOffer(payload);
        toast.success("Offer created ✅");
      }
      resetForm();
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save offer");
    }
  };

  const handleEdit = (offer) => {
    setForm({
      code: offer.code || "",
      title: offer.title || "",
      description: offer.description || "",
      discountType: offer.discountType,
      value: offer.value,
      maxDiscountAmount: offer.maxDiscountAmount ?? "",
      minBookingAmount: offer.minBookingAmount ?? "",
      applicableMethods: offer.applicableMethods?.length ? offer.applicableMethods : ["any"],
      validFrom: offer.validFrom?.slice(0, 10) || "",
      validTill: offer.validTill?.slice(0, 10) || "",
      usageLimit: offer.usageLimit ?? "",
      perUserLimit: offer.perUserLimit ?? 1,
    });
    setEditingId(offer._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await deleteOffer(id);
      toast.success("Offer deleted");
      fetchOffers();
    } catch (err) {
      toast.error("Failed to delete offer");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${p.border}`,
    fontSize: 13,
    color: p.text1,
    background: p.surface2,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: p.text2, marginBottom: 5, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: p.pageBg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: p.surface, borderBottom: `1px solid ${p.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/owner/dashboard")} style={{ background: p.surface2, color: p.text2, width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", fontSize: 16 }}>←</button>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: p.text1, margin: 0 }}>My Offers</h1>
            <p style={{ fontSize: 12, color: p.text3, margin: 0 }}>{myHotels[0]?.name || "Manage coupons for your property"}</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={loadingHotel || !selectedHotel}
          style={{
            background: loadingHotel || !selectedHotel ? p.text3 : p.accent,
            color: "#fff", padding: "9px 18px",
            borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none",
            cursor: loadingHotel || !selectedHotel ? "not-allowed" : "pointer",
          }}
        >
          + New Offer
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Create/Edit form ────────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: p.surface, borderRadius: 18, padding: 20, border: `1px solid ${p.border}`, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: p.text1 }}>{editingId ? "Edit Offer" : "New Offer"}</h3>
              <button type="button" onClick={resetForm} style={{ background: "none", border: "none", color: p.text3, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Weekend Special" />
              </div>
              <div>
                <label style={labelStyle}>Code (optional)</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={inputStyle} placeholder="WEEKEND15" />
              </div>
              <div>
                <label style={labelStyle}>Discount Type *</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} style={inputStyle}>
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Value *</label>
                <input required type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={inputStyle} placeholder={form.discountType === "flat" ? "300" : "15"} />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label style={labelStyle}>Max Discount Cap (₹)</label>
                  <input type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} style={inputStyle} placeholder="Optional" />
                </div>
              )}
              <div>
                <label style={labelStyle}>Min Booking Amount (₹)</label>
                <input type="number" min="0" value={form.minBookingAmount} onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })} style={inputStyle} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Valid From *</label>
                <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Valid Till *</label>
                <input required type="date" value={form.validTill} onChange={(e) => setForm({ ...form, validTill: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Usage Limit (total)</label>
                <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} style={inputStyle} placeholder="Unlimited" />
              </div>
              <div>
                <label style={labelStyle}>Per-User Limit</label>
                <input type="number" min="1" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Applicable Payment Methods</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {METHOD_OPTIONS.map((m) => {
                  const active = form.applicableMethods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMethodToggle(m)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        border: `1px solid ${active ? p.accent : p.border}`,
                        background: active ? p.accent : p.surface2,
                        color: active ? "#fff" : p.text2,
                        cursor: "pointer", textTransform: "capitalize",
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="submit" style={{ background: p.accent, color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                {editingId ? "Save Changes" : "Create Offer"}
              </button>
              <button type="button" onClick={resetForm} style={{ background: p.surface2, color: p.text2, padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${p.border}`, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Offer list ──────────────────────────────────────── */}
        {loading ? (
          <p style={{ textAlign: "center", color: p.text3, padding: "40px 0" }}>Loading offers…</p>
        ) : offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: p.text3 }}>
            <p style={{ fontSize: 38, marginBottom: 10 }}>🎟️</p>
            <p>No offers yet — create one to attract more bookings</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {offers.map((o) => {
              const isExpired = new Date(o.validTill) < new Date();
              const isActive = o.isActive && !isExpired;
              return (
                <div key={o._id} style={{ background: p.surface, borderRadius: 16, padding: "16px 18px", border: `1px solid ${p.border}`, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: p.text1, margin: 0 }}>{o.title}</p>
                      {o.code && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: p.accentBg, color: p.accent, fontFamily: "monospace" }}>{o.code}</span>}
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: isActive ? p.greenBg : p.redBg, color: isActive ? p.green : p.red }}>
                        {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: p.text2, margin: "2px 0" }}>
                      {o.discountType === "flat" ? `₹${o.value} off` : `${o.value}% off${o.maxDiscountAmount ? ` (up to ₹${o.maxDiscountAmount})` : ""}`}
                      {o.minBookingAmount > 0 && ` · Min ₹${o.minBookingAmount}`}
                      {" · "}Used {o.usedCount}{o.usageLimit ? `/${o.usageLimit}` : ""}
                    </p>
                    <p style={{ fontSize: 11, color: p.text3, margin: "2px 0" }}>
                      {new Date(o.validFrom).toLocaleDateString("en-IN")} → {new Date(o.validTill).toLocaleDateString("en-IN")}
                      {!o.applicableMethods?.includes("any") && ` · Methods: ${o.applicableMethods.join(", ")}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <button onClick={() => handleEdit(o)} style={{ fontSize: 12, fontWeight: 600, color: p.accent, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => handleDelete(o._id)} style={{ fontSize: 12, fontWeight: 600, color: p.red, background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerOffers;