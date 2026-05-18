 import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "../services/authService";
import HotelCard from "../component/HotelCard";

const Wishlist = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const data = await getWishlist();
      console.log("Wishlist data:", data); // ✅ DEBUG
      setHotels(data);
    };

    fetchWishlist();
  }, []);

  // ✅ Remove a single hotel from wishlist
    const handleRemove = async (hotelId) => {
      console.log("Removing hotel:", hotelId); // ✅ DEBUG
      await toggleWishlist(hotelId); // toggles OFF (removes) since it's already wishlisted
      setHotels((prev) => prev.filter((h) => String(h._id) !== String(hotelId)));
    };
  
    // ✅ Clear all wishlisted hotels one by one
    const handleClearAll = async () => {
      console.log("Clearing all wishlist items"); // ✅ DEBUG
      for (const hotel of hotels) {
        await toggleWishlist(hotel._id);
      }
      setHotels([]);
    };

  return (
    <div className="p-6">
      <div className="shadow p-4 relative">
        <div>
           <h1 className="text-xl font-bold mb-4  ">❤️ My Wishlist</h1>
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
      
    {/* ✅ Clear All Button — only shown when there are items */}
      {hotels.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearAll}
            className="bg-red-100 text-red-600 border border-red-400 hover:bg-red-500 hover:text-white transition px-4 py-2 rounded font-semibold text-sm"
          >
            🗑️ Clear All Wishlist
          </button>
        </div>
      )}
      {hotels.length === 0 ? (
        <p>No items in wishlist</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-2">
          {/* {hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} onRemove={handleRemove} />
          ))} */}

          {hotels.map((hotel) => {
  console.log("Rendering hotel:", hotel._id, "onRemove:", typeof handleRemove);
  return (
    <HotelCard key={hotel._id} hotel={hotel} onRemove={handleRemove} />
  );
})}
        </div>
      )}
    </div>
  );
};

export default Wishlist;