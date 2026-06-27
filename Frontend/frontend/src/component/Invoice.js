const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Invoice = ({ data }) => {
  if (!data) return null;

  // Shared cell style — defined once, used for every td/th
  // All values are hardcoded hex so no CSS variable or dark-mode
  // rule can override them.
  const thStyle = {
    color:           "#111827",
    backgroundColor: "#e5e7eb",
    fontWeight:      "600",
    padding:         "8px 12px",
    border:          "1px solid #d1d5db",
    textAlign:       "left",
  };
  const tdStyle = {
    color:           "#111827",
    backgroundColor: "#ffffff",
    padding:         "8px 12px",
    border:          "1px solid #d1d5db",
  };

  return (
    // Outer wrapper just controls width in the page flow
    <div style={{ width: "100%", maxWidth: "576px", margin: "0 auto" }}>

      {/* ── Invoice card ──────────────────────────────────────────────────────
          Every style is inline so the browser specificity chain ends here.
          Dark-mode class-based rules (Tailwind dark:, .dark-mode selectors)
          only beat inline styles when they use !important AND target the
          element directly. The <style> tag below handles that last case. */}
      <div
        id="invoice"
        style={{
          backgroundColor: "#ffffff",
          color:           "#111827",
          fontFamily:      "Arial, Helvetica, sans-serif",
          padding:         "32px 24px",
          borderRadius:    "12px",
          boxShadow:       "0 2px 8px rgba(0,0,0,0.08)",
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          width:           "100%",
          boxSizing:       "border-box",
        }}
      >
        {/* Scoped override — only fires inside #invoice.
            Beats any external !important dark-mode rules that target
            td / th / p by adding higher specificity via the #invoice prefix. */}
        <style>{`
          #invoice { background-color: #ffffff !important; color: #111827 !important; }
          #invoice p, #invoice b, #invoice h2 { color: inherit !important; }
          #invoice table { background-color: #ffffff !important; }
          #invoice th { color: #111827 !important; background-color: #e5e7eb !important; }
          #invoice td { color: #111827 !important; background-color: #ffffff !important; }
        `}</style>

        {/* Logo */}
        <svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,5)">
            <circle cx="25" cy="20" r="18" fill="#2563EB" />
            <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
          </g>
          <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">
            SafarSetu
          </text>
        </svg>

        {/* Heading */}
        <h2 style={{ color: "#16a34a", fontSize: "24px", fontWeight: "700", margin: "12px 0 16px" }}>
          Booking Invoice
        </h2>

        {/* Company */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#111827", fontWeight: "600", margin: "2px 0" }}>SafarSetu Pvt Ltd</p>
          <p style={{ color: "#4b5563", margin: "2px 0" }}>GST: 22AAAAA0000A1Z5</p>
        </div>

        {/* Order info */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#111827", margin: "3px 0" }}><b>Order No:</b> {data.orderNumber}</p>
          <p style={{ color: "#111827", margin: "3px 0" }}><b>Transaction ID:</b> {data.razorpayPaymentId}</p>
          <p style={{ color: "#111827", margin: "3px 0" }}><b>Paid On:</b> {formatDateTime(data.createdAt)}</p>
        </div>

        {/* User */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "#111827", margin: "3px 0" }}><b>Name:</b> {data.name}</p>
          <p style={{ color: "#111827", margin: "3px 0" }}><b>Email:</b> {data.email}</p>
        </div>

        {/* Check-in / Check-out pills */}
        {(data.checkIn || data.checkOut) && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            {data.checkIn && (
              <span style={{
                color: "#15803d", backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0", borderRadius: "8px",
                padding: "6px 12px", fontSize: "13px", fontWeight: "500",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Check-in: {formatDate(data.checkIn)}
              </span>
            )}
            {data.checkOut && (
              <span style={{
                color: "#6d28d9", backgroundColor: "#f5f3ff",
                border: "1px solid #ddd6fe", borderRadius: "8px",
                padding: "6px 12px", fontSize: "13px", fontWeight: "500",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Check-out: {formatDate(data.checkOut)}
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr>
              {["Hotel", "Rooms", "Guests", "Nights", "Amount"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {[data.hotelName, data.rooms, data.guests, data.nights, `₹${data.amount}`].map((val, i) => (
                <td key={i} style={tdStyle}>{val}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* GST + Total */}
        <div style={{ marginTop: "16px", textAlign: "right", width: "100%" }}>
          <p style={{ color: "#374151", margin: "4px 0" }}>GST (18%): ₹{Math.round(data.amount * 0.18)}</p>
          <p style={{ color: "#111827", fontWeight: "700", fontSize: "18px", margin: "4px 0" }}>
            Total: ₹{Math.round(data.amount * 1.18)}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Invoice;