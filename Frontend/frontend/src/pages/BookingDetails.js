 import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setBookings(res.data);
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id} className="border p-3 my-2 rounded">
            <p>Hotel: {b.hotelName}</p>
            <p>Date: {b.date}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Bookings;