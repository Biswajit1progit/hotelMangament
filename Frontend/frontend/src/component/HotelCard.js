import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toggleWishlist } from "../services/authService";
import { isLoggedIn } from "../utils/auth";
import { getOffersForHotel } from "../services/Offerservice";

function HotelCard({ hotel, wishlist = [], setWishlist, onRemove, index = 0 }) {
  const navigate = useNavigate();

  // ── Offer badge — lightweight per-card check for any active offer.
  // NOTE: this fires one request per visible card. Fine for a listing
  // page with a normal number of results; if the grid grows large or
  // this feels slow, the better fix is a backend change — have your
  // hotels-list endpoint return a `hasActiveOffers` boolean per hotel
  // (a single aggregate query) so this per-card fetch isn't needed at all.
  const [hasOffers, setHasOffers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkOffers = async () => {
      if (!hotel?._id) return;
      try {
        const offers = await getOffersForHotel(hotel._id);
        if (!cancelled) setHasOffers(offers.length > 0);
      } catch (err) {
        // Silent fail — a missing badge isn't worth surfacing an error for
        if (!cancelled) setHasOffers(false);
      }
    };
    checkOffers();
    return () => { cancelled = true; };
  }, [hotel?._id]);

  const handleClick = () => {
    // ── FIXED: was reading sessionStorage.getItem("token") which is always
    // null now that the access token lives in memory (apiClient.js).
    // isLoggedIn() checks sessionStorage("user") which IS still written on login.
    if (!isLoggedIn()) {
      navigate("/login", {
        state: { from: `/hotel/${hotel._id}` },
      });
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const checkIn  = searchParams.get("checkIn")  || "";
    const checkOut = searchParams.get("checkOut") || "";

    navigate(`/hotel/${hotel._id}`, {
      state: { checkIn, checkOut },
    });
  };

  const liked = Array.isArray(wishlist) &&
                wishlist.map(String).includes(String(hotel._id));

  const handleWishlist = async () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    const updated = await toggleWishlist(hotel._id);
    if (setWishlist) setWishlist(updated);
  };

  const getImageSrc = (img) => {
    if (!img) return "/fallback.jpg";
    if (img.startsWith("http")) return img;
    return `${process.env.REACT_APP_API_URL}${img}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="
        group flex flex-col rounded-3xl overflow-hidden
        bg-white/70 backdrop-blur-xl border border-white/30
        shadow-lg hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 h-full
      "
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={getImageSrc(hotel.images?.[0])}
          alt={hotel.name}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <p className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-bold py-1 px-3 rounded-full text-sm">
          ₹{hotel.pricePerNight}/night
        </p>
        <p className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white font-bold py-1 px-3 rounded-full text-sm">
          {hotel.type}
        </p>

        {/* NEW: offer availability badge */}
        {hasOffers && (
          <p className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-1 px-3 rounded-full text-xs shadow-md flex items-center gap-1">
            🎟️ Offers
          </p>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="font-bold text-xl truncate">{hotel.name}</h2>
        <p className="text-gray-600 mt-1">📍 {hotel.district}</p>
        <div className="mt-3">
          <p className="font-semibold text-lg">₹{hotel.pricePerNight}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-500 font-semibold">
            ⭐ {hotel.averageRating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-gray-500 text-sm">
            ({hotel.totalReviews || 0} reviews)
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-4 flex justify-between gap-2">
          {onRemove ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(hotel._id)}
              className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              🗑️ Remove
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleWishlist}
              className={`px-3 py-2 rounded-xl transition ${
                liked ? "bg-red-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {liked ? "❤️ Added" : "🤍 Wishlist"}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default HotelCard;