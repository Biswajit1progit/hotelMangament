import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllOffersAdmin,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../../services/offerService";
import api from "../../services/apiClient";

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  scope: "platform",
  hotel: "",
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

function AdminOffers({ dark }) {
  const [offers, setOffers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  // ── Hotel search dropdown (only for the "scope: hotel" picker) ──────────
  const [hotelSearch, setHotelSearch] = useState("");
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchHotels();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getAllOffersAdmin();
      setOffers(data);
    } catch (err) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/api/admin/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setHotelSearch("");
    setShowHotelDropdown(false);
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

    if (form.scope === "hotel" && !form.hotel) {
      toast.error("Please select a hotel from the search results");
      return;
    }

    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        hotel: form.scope === "hotel" ? form.hotel : undefined,
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
      scope: offer.scope,
      hotel: offer.hotel?._id || offer.hotel || "",
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
    setHotelSearch(offer.hotel?.name || "");
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

  const filteredOffers = offers.filter(
    (o) =>
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.code?.toLowerCase().includes(search.toLowerCase()) ||
      o.hotel?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--text-primary)",
    background: "var(--surface2)",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, display: "block" };

  if (loading) {
    return <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>Loading offers…</p>;
  }

  return (
    <div className="space-y-3">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search offers by title, code, or hotel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            background: "#3b82f6", color: "#fff", padding: "9px 18px",
            borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
          }}
        >
          + New Offer
        </button>
      </div>

      {/* ── Create/Edit form ───────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ background: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", marginBottom: 20 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {editingId ? "Edit Offer" : "New Offer"}
            </h3>
            <button type="button" onClick={resetForm} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Summer Sale" />
            </div>

            <div>
              <label style={labelStyle}>Code (optional)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={inputStyle} placeholder="SUMMER20" />
            </div>

            <div>
              <label style={labelStyle}>Scope *</label>
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} style={inputStyle}>
                <option value="platform">Platform-wide</option>
                <option value="hotel">Specific hotel</option>
              </select>
            </div>

            {form.scope === "hotel" && (
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Hotel *</label>
                <input
                  type="text"
                  value={hotelSearch}
                  onChange={(e) => {
                    setHotelSearch(e.target.value);
                    setShowHotelDropdown(true);
                    // Typing invalidates a previous selection until they pick again
                    if (form.hotel) setForm((f) => ({ ...f, hotel: "" }));
                  }}
                  onFocus={() => setShowHotelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowHotelDropdown(false), 150)}
                  placeholder="Search hotel by name…"
                  style={inputStyle}
                  autoComplete="off"
                  required={!form.hotel}
                />
                {/* Hidden required-field guard: form.hotel must be set via selection below */}
                {showHotelDropdown && (
                  <div
                    style={{
                      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
                      marginTop: 4, maxHeight: 220, overflowY: "auto",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 10, boxShadow: "var(--shadow)",
                    }}
                  >
                    {hotels
                      .filter((h) => h.name?.toLowerCase().includes(hotelSearch.toLowerCase()))
                      .slice(0, 30)
                      .map((h) => (
                        <div
                          key={h._id}
                          onMouseDown={() => {
                            setForm((f) => ({ ...f, hotel: h._id }));
                            setHotelSearch(h.name);
                            setShowHotelDropdown(false);
                          }}
                          style={{
                            padding: "9px 12px", fontSize: 13, cursor: "pointer",
                            color: "var(--text-primary)",
                            background: form.hotel === h._id ? "var(--surface2)" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = form.hotel === h._id ? "var(--surface2)" : "transparent")}
                        >
                          {h.name}
                          <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 6 }}>
                            {h.district}, {h.state}
                          </span>
                        </div>
                      ))}
                    {hotels.filter((h) => h.name?.toLowerCase().includes(hotelSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-muted)" }}>
                        No hotels match "{hotelSearch}"
                      </div>
                    )}
                  </div>
                )}
                {!form.hotel && hotelSearch && !showHotelDropdown && (
                  <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Select a hotel from the list</p>
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>Discount Type *</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} style={inputStyle}>
                <option value="flat">Flat (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Value *</label>
              <input required type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={inputStyle} placeholder={form.discountType === "flat" ? "500" : "20"} />
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
                      border: `1px solid ${active ? "#3b82f6" : "var(--border)"}`,
                      background: active ? "#3b82f6" : "var(--surface2)",
                      color: active ? "#fff" : "var(--text-secondary)",
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
            <button type="submit" style={{ background: "#3b82f6", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
              {editingId ? "Save Changes" : "Create Offer"}
            </button>
            <button type="button" onClick={resetForm} style={{ background: "var(--surface2)", color: "var(--text-secondary)", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Offer list ──────────────────────────────────────────── */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: 38, marginBottom: 10 }}>🎟️</p>
          <p>No offers found</p>
        </div>
      ) : (
        filteredOffers.map((o) => {
          const now = new Date();
          const isExpired = new Date(o.validTill) < now;
          const isActive = o.isActive && !isExpired;

          return (
            <div key={o._id} style={{ background: "var(--surface)", borderRadius: 16, padding: "16px 18px", boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{o.title}</p>
                  {o.code && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#eff6ff", color: "#3b82f6", fontFamily: "monospace" }}>{o.code}</span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: o.scope === "platform" ? "#f3e8ff" : "#dcfce7", color: o.scope === "platform" ? "#7e22ce" : "#15803d" }}>
                    {o.scope === "platform" ? "Platform" : o.hotel?.name || "Hotel-specific"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#15803d" : "#b91c1c" }}>
                    {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0" }}>
                  {o.discountType === "flat" ? `₹${o.value} off` : `${o.value}% off${o.maxDiscountAmount ? ` (up to ₹${o.maxDiscountAmount})` : ""}`}
                  {o.minBookingAmount > 0 && ` · Min ₹${o.minBookingAmount}`}
                  {" · "}Used {o.usedCount}{o.usageLimit ? `/${o.usageLimit}` : ""}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0" }}>
                  {new Date(o.validFrom).toLocaleDateString("en-IN")} → {new Date(o.validTill).toLocaleDateString("en-IN")}
                  {!o.applicableMethods?.includes("any") && ` · Methods: ${o.applicableMethods.join(", ")}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <button onClick={() => handleEdit(o)} style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(o._id)} style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminOffers;