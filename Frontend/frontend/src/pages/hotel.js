import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Hotelnav from "../component/filters/Hotelnav";
import FilterSidebar from "../component/filters/Hotelfilters.";
import HotelCard from "../component/HotelCard";
import { searchHotels } from "../services/hotelservice";
import { isLoggedIn } from "../utils/auth";
import { getHotels } from "../services/hotelservice";
import { getWishlist } from "../services/authService";
import Footer from "../component/footer";
import ChatBot from "../component/ChatBot";
import { HotelListingSkeleton } from "../component/Skeleton";

function Hotels() {
  const location = useLocation();
  const [hotels, setHotels] = useState(location.state || []);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({
    district: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    amenities: [],
  });
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMoreHotels = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    fetchAllHotels();
  }, [location.search]);

  const fetchAllHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const filters = { district: params.get("district") };
      const data = await searchHotels(filters);
      setHotels(data);
      if (isLoggedIn()) {
        const wishData = await getWishlist();
        setWishlist(wishData.map((h) => String(h._id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const districtFromURL = params.get("district");
      const finalFilters = {
        ...filters,
        district: districtFromURL || filters.district,
      };
      Object.keys(finalFilters).forEach(
        (key) =>
          (!finalFilters[key] || finalFilters[key] === "") &&
          delete finalFilters[key]
      );
      const data = await searchHotels(finalFilters);
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetWishlist = (updated) => {
    if (!Array.isArray(updated)) return;
    const ids = updated.map((item) =>
      typeof item === "object" ? String(item._id) : String(item)
    );
    setWishlist(ids);
  };

  // Client-side search — name / district / state
  const filteredHotels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.district?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q)
    );
  }, [searchQuery, hotels]);

  return (
    <>
      {/* Navbar — unchanged */}
      <div className="fixed top-0 right-0 left-0 z-50 bg-white shadow-md h-16">
        <Hotelnav />
      </div>

      {/* Main Page — unchanged */}
      <div className="pt-20 mt-7 px-4 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — unchanged */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-29 self-start bg-white z-10">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              applyFilters={applyFilters}
            />
          </div>

          {/* Hotels Section */}
          <div className="w-full lg:w-3/4 mt-4">

            {/* Search bar — normal flow, above hotel grid */}
            <div className="mb-4">
              <div className="relative w-full sm:w-2/3 md:w-1/2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(6);
                  }}
                  placeholder="Search by hotel name, district or state..."
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setVisibleCount(6); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold transition"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Result count — only when searching */}
              {searchQuery.trim() && !loading && (
                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                  {filteredHotels.length === 0
                    ? `No hotels match "${searchQuery.trim()}"`
                    : `${filteredHotels.length} hotel${filteredHotels.length > 1 ? "s" : ""} found for "${searchQuery.trim()}"`}
                </p>
              )}
            </div>

            {/* Skeleton or hotel grid */}
            {loading ? (
              <HotelListingSkeleton count={6} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.length > 0 ? (
                    filteredHotels.slice(0, visibleCount).map((hotel) => (
                      <HotelCard
                        key={hotel._id}
                        hotel={hotel}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center w-full">
                      No hotels found
                    </p>
                  )}
                </div>

                {/* Load More Button — unchanged */}
                {visibleCount < filteredHotels.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreHotels}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Show More ↓
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Footer — unchanged */}
      <Footer />
      {/* Chat Bot */}
      <ChatBot />
    </>
  );
}

export default Hotels;