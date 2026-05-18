 import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toggleWishlist } from "../services/authService";
import { isLoggedIn } from "../utils/auth";

function HotelCard({ hotel, wishlist=[], setWishlist, onRemove }) {

 /*  const [liked, setLiked] = useState(false); */
       const handleClick = () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      // ❌ Not logged in → go login
      navigate("/login", {
        state: { from: `/hotel/${hotel._id}` },
      });
    } else {
      // ✅ Already logged in → go hotel page
      /* navigate(`/hotel/${hotel._id}`); */
      const searchParams = new URLSearchParams(window.location.search);
     const checkIn = searchParams.get("checkIn") || "";
       const checkOut = searchParams.get("checkOut") || "";

           navigate(`/hotel/${hotel._id}`, {
             state: { checkIn, checkOut }
         });
    }
  };
//Wishlist
  /* const handleWishlist = async () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    await toggleWishlist(hotel._id);
    setLiked(!liked);
  };
 */
// ✅ CHECK FROM BACKEND DATA
  const liked = Array.isArray(wishlist) && 
               wishlist.map(String).includes(String(hotel._id));

  const handleWishlist = async () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const updated = await toggleWishlist(hotel._id);

    // ✅ UPDATE STATE FROM RESPONSE
     if (setWishlist) {
    setWishlist(updated);
  }
  };

  //Handeling the images url
  const getImageSrc = (img) => {
  if (!img) return "/fallback.jpg";

  // ✅ if already full URL
  if (img.startsWith("http")) {
    return img;
  }

  // ✅ if local image
  return `${process.env.REACT_APP_API_URL}${img}`;
};
 return (
  <div
   className="
  cursor-pointer
  shadow-lg
  rounded-lg
  p-3
  bg-gray-100
  hover:shadow-xl
  transition
  duration-300
  w-full
  min-h-[400px]
  flex
  flex-col
  justify-between
"
  >
    {/* Image Section */}
    <div className="relative h-48 overflow-hidden rounded-lg">
      <img
        src={getImageSrc(hotel.images?.[0])}
        alt={hotel.name}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />

      {/* Price Badge */}
      <p className="absolute top-2 left-2 bg-gray-800 text-white font-bold py-1 px-2 rounded-xl text-xs sm:text-sm">
        ₹{hotel.pricePerNight}/per night
      </p>

      {/* Hotel Type Badge */}
      <p className="absolute bottom-2 right-2 bg-gray-800 text-white font-bold py-1 px-2 rounded-xl text-xs sm:text-sm">
        {hotel.type} type
      </p>
    </div>

    {/* Hotel Info */}
    <div className="mt-3 flex-grow">
      <h2 className="font-bold text-lg truncate">{hotel.name}</h2>
      <p className="text-gray-700">{hotel.district}</p>

      <div className="mt-2">
        <p className="font-medium text-sm sm:text-base">
          <span>Price: </span>₹{hotel.pricePerNight}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-yellow-500 font-semibold">
          ⭐ {hotel.averageRating?.toFixed(1) || "0.0"}
        </span>
        <span className="text-gray-500 text-sm">
          ({hotel.totalReviews || 0} reviews)
        </span>
      </div>
    </div>

    {/* Buttons Section - Fixed Position */}
    <div className="mt-2 flex justify-between items-center gap-2">

        {/* ✅ If onRemove is passed (Wishlist page) → show Remove button */}
        {/* ✅ Otherwise → show normal Wishlist toggle button */}
        {onRemove ? (
          <button
            onClick={() => onRemove(hotel._id)}
            className="px-3 py-2 rounded text-sm sm:text-base whitespace-nowrap bg-red-500 text-white hover:bg-red-600 transition"
          >
            🗑️ Remove
          </button>
        ) : (
          <button
            onClick={handleWishlist}
            className={`px-3 py-2 rounded text-sm sm:text-base whitespace-nowrap ${
              liked ? "bg-red-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {liked ? "❤️ Added" : "🤍 Wishlist"}
          </button>
        )}

        {/* View Details Button */}
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition text-sm sm:text-base whitespace-nowrap"
        >
          View Details
        </button>
      </div>
  </div>
);

 }
export default HotelCard;