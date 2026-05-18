import { useParams } from "react-router-dom";
import { useState } from "react";

function Booking() {
  const { id } = useParams();

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
  });

  const handleBooking = async () => {
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hotelId: id, ...form }),
    });

    const data = await res.json();

    // redirect to payment
    window.location.href = data.paymentUrl;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h1 className="text-xl font-bold mb-4">Booking</h1>

      <input type="date"
        onChange={(e)=>setForm({...form,checkIn:e.target.value})}
        className="border p-2 w-full mb-2"
      />

      <input type="date"
        onChange={(e)=>setForm({...form,checkOut:e.target.value})}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleBooking}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Proceed to Payment
      </button>

    </div>
  );
}

export default Booking;