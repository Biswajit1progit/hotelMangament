import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── All logic identical to original — only UI updated ─────────
function HotelSearch() {
  const [form, setForm] = useState({ district: "", checkIn: "", checkOut: "" });
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "checkOut" || name === "checkIn") {
      const inDate = new Date(updated.checkIn);
      const outDate = new Date(updated.checkOut);
      if (updated.checkIn && updated.checkOut && outDate <= inDate) {
        setDateError("Check-out must be after check-in");
      } else {
        setDateError("");
      }
    }
  };

  const handleSearch = async () => {
    if (!form.district.trim()) { alert("Please enter a district"); return; }
    if (dateError) { alert(dateError); return; }

    setLoading(true);
    const params = new URLSearchParams();
    params.set("district", form.district);
    if (form.checkIn) params.set("checkIn", form.checkIn);
    if (form.checkOut) params.set("checkOut", form.checkOut);
    navigate(`/hotels?${params.toString()}`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">

      {/* District */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-gray-400 font-medium mb-1 px-1">District</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition bg-white">
          <span className="text-gray-400 text-sm shrink-0">📍</span>
          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="e.g. Goa, Jaipur, Manali"
            className="outline-none font-semibold w-full text-sm text-gray-800 placeholder-gray-300 bg-transparent"
          />
        </div>
      </div>

      {/* Check In */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-gray-400 font-medium mb-1 px-1">Check In</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition bg-white">
          <span className="text-gray-400 text-sm shrink-0">📅</span>
          <input
            type="date"
            name="checkIn"
            value={form.checkIn}
            min={today}
            onChange={handleChange}
            className="outline-none font-semibold w-full text-sm text-gray-800 bg-transparent"
          />
        </div>
      </div>

      {/* Check Out */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-gray-400 font-medium mb-1 px-1">Check Out</label>
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 focus-within:ring-1 transition bg-white ${
          dateError
            ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
            : "border-gray-200 focus-within:border-blue-400 focus-within:ring-blue-100"
        }`}>
          <span className="text-gray-400 text-sm shrink-0">📅</span>
          <input
            type="date"
            name="checkOut"
            value={form.checkOut}
            min={form.checkIn || today}
            onChange={handleChange}
            className="outline-none font-semibold w-full text-sm text-gray-800 bg-transparent"
          />
        </div>
        {dateError && (
          <p className="text-red-500 text-xs mt-1 px-1">{dateError}</p>
        )}
      </div>

      {/* Search Button */}
      <div className="flex flex-col justify-end">
        <label className="block text-xs text-transparent mb-1 px-1 select-none">Search</label>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Searching...
            </span>
          ) : "Search"}
        </button>
      </div>
    </div>
  );
}

export default HotelSearch;