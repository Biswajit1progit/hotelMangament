
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { getUserBookings } from "../services/bookingService";
import { getUserPayments } from "../services/paymentService";
import { refundPayment } from "../services/paymentService";
import MyBookings from "../component/MyBooking";
import PaymentDetails from "../component/PaymentDetails";
import ImageGallery from "../component/ImageGallery";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]); // ✅ ADD THIS
/* Profile */

 const handleCancelBooking = async (paymentId) => {
  const res = await refundPayment(paymentId);

  if (res.success) {
    alert("Refunded Successfully ✅");

    setBookings((prev) =>
      prev.map((item) =>
        item._id === paymentId
          ? { ...item, status: "refunded" }
          : item
      )
    );
  }
};
/*  Fetch Bookings AFTER user loads */
  useEffect(() => {
    if (!user) return; // ✅ IMPORTANT

    fetch(`${process.env.REACT_APP_API_URL}/api/payment/user/${user.email}`)
      .then(res => res.json())
      .then(setBookings);

  }, [user]); // ✅ DEPENDENCY FIX


  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setUser(res.data);
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      
      <h1 className="text-2xl font-bold">My Profile</h1>
       
      {user && (
        <div className="mt-4 shadow p-4 rounded relative flex ">
          <div className="  border-2 rounded-full p-2 bg-gray-200">
                 <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  className="w-6 h-6"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1"
    d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
  />
                 </svg>
                 </div>
          
          <div className="ml-2">
            
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          </div>
           <div className="absolute right-2 top-4">
         <svg
      width="160"
      height="50"
      viewBox="0 0 160 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon */}
      <g transform="translate(0,5)">
        <circle cx="25" cy="20" r="18" fill="#2563EB" />

        <path
          d="M5 28 C18 5, 32 5, 45 20"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        <polygon
          points="28,10 42,16 28,20 32,26 24,20 12,22"
          fill="white"
        />
      </g>

      {/* Text */}
      <text
        x="50"
        y="31"
        fontFamily="Poppins, Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#091fed"
        display="flex"
      >
       SafarSetu
      </text>
       </svg> 
           </div>
        </div>
      )}

      {/* 🔥 BOOKING HISTORY */}
      <h2 className="text-xl mt-6 font-semibold">My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id} className="border p-3 mt-3 rounded">
            <p><b>Hotel:</b> {b.hotelName}</p>
            <p><b>Amount:</b> ₹{b.amount}</p>
            <p><b>Order No:</b> {b.orderNumber}</p>
            <p><b>Booking ID:</b> {b.bookingId}</p>
            <p><b>Status:</b> {b.status}</p>
            <button
              onClick={() => window.open(`/success/${b.bookingId}`)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            >
              View Receipt
            </button>

            <button
            onClick={() =>{
              console.log("Canceling booking with ID:", b._id); 
              handleCancelBooking(b._id)
            } }
            className="bg-red-600 text-white px-3 py-1 rounded mt-2 ml-2"
           >
            Cancel Booking
            </button>
          </div>
        ))
      )}

    </div>
  );
};

export default Profile;