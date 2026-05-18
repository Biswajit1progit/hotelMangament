import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchHotels } from "../../services/hotelservice";

function HotelSearch() {
  const [form, setForm] = useState({
    district: "",
    checkIn: "",
    checkOut: "",
  });

  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    // ✅ Validate checkout is after checkin
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
    try {
      if (!form.district.trim()) {
        alert("Please enter a district");
        return;
      }
      if (dateError) {
        alert(dateError);
        return;
      }

      setLoading(true);

      // ✅ Pass dates in URL so Hotels page & BookingForm can use them
      const params = new URLSearchParams();
      params.set("district", form.district);
      if (form.checkIn) params.set("checkIn", form.checkIn);
      if (form.checkOut) params.set("checkOut", form.checkOut);

      navigate(`/hotels?${params.toString()}`);
    } catch (error) {
      alert("Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full p-4">
      
      {/* District */}
      <div className="border p-3 rounded-lg w-full">
        <p className="text-xs text-gray-400 mb-1">District</p>
        <input
          name="district"
          value={form.district}
          onChange={handleChange}
          placeholder="e.g. Goa"
          className="outline-none font-semibold w-full text-sm sm:text-base min-w-0"
        />
      </div>

      {/* Check In */}
      <div className="border p-3 rounded-lg w-full">
        <p className="text-xs text-gray-400 mb-1">Check In</p>
        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          min={today}
          onChange={handleChange}
          className="outline-none font-semibold w-full text-sm sm:text-base"
        />
      </div>

      {/* Check Out */}
      <div className={`border p-3 rounded-lg w-full ${dateError ? "border-red-400" : ""}`}>
        <p className="text-xs text-gray-400 mb-1">Check Out</p>
        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          min={form.checkIn || today}
          onChange={handleChange}
          className="outline-none font-semibold w-full text-sm sm:text-base"
        />
        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
      </div>

      {/* Search Button */}
      <button
        className="bg-blue-600 text-white rounded-lg font-semibold p-3 w-full hover:bg-blue-700 transition text-sm sm:text-base min-h-[52px]"
        type="button"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}

export default HotelSearch;