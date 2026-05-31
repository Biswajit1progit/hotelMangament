import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Hotelnav from "../component/filters/Hotelnav";
import FilterSidebar from "../component/filters/Hotelfilters.";
import HotelCard from "../component/HotelCard";
import { searchHotels } from "../services/hotelservice";
import { isLoggedIn } from "../utils/auth";
import { getHotels } from "../services/hotelservice";
import { getWishlist } from "../services/authService";
import Footer from "../component/footer";

// ── ADD: import skeleton ──────────────────────────────────────
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

  // ── ADD: loading state ────────────────────────────────────
  const [loading, setLoading] = useState(true);

  const loadMoreHotels = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    fetchAllHotels();
  }, [location.search]);

  const fetchAllHotels = async () => {
    // ── ADD: set loading true before fetch ────────────────
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
      // ── ADD: set loading false after fetch ────────────
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    // ── ADD: show skeleton while filtering ───────────────
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

            {/* ── ONLY CHANGE: show skeleton while loading ── */}
            {loading ? (
              <HotelListingSkeleton count={6} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.length > 0 ? (
                    hotels.slice(0, visibleCount).map((hotel) => (
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
                {visibleCount < hotels.length && (
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
    </>
  );
}

export default Hotels;