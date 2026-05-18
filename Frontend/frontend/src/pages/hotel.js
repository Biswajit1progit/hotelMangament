/*  import { useLocation } from "react-router-dom";
import Hotelnav from "../component/filters/Hotelnav";

function Hotels(){

 const location = useLocation();
 const hotels = location.state || [];

 return(
  <>
 <Hotelnav/>
  <div className="grid grid-cols-4 gap-2">
       <div className="bg-gray-600 border "></div>
      <div className="flex gap-4 flex-wrap justify-center p-4 col-span-3 ">

   {hotels.map((hotel)=>(
    <div key={hotel._id} className=" rounded-lg w-[280px] h-[200px] flex flex-col items-center justify-center p-2 shadow-lg pointer-events:hover:scale-105 transition-transform duration-300 overflow-hidden">
      <img src={`http://localhost:5000/images/${hotel.images[0]}`} alt={hotel.name} className="w-full h-[100px] object-cover rounded-lg" />
      {console.log(hotel.images[0])}
      <h2>{hotel.name}</h2>
      <p>{hotel.location}</p>
      <p>${hotel.price}</p>
      <p>{hotel.rating}</p>
    </div>
   ))}

      </div>
  </div>
  
  </>
 
 );
}

export default Hotels; */
import { useLocation } from "react-router-dom";
import { useState,useEffect } from "react";
import Hotelnav from "../component/filters/Hotelnav";
import FilterSidebar from "../component/filters/Hotelfilters.";
import HotelCard from "../component/HotelCard";
import { searchHotels } from "../services/hotelservice";
import { isLoggedIn } from "../utils/auth";
import { getHotels } from "../services/hotelservice";
import { getWishlist } from "../services/authService";
import Footer from "../component/footer";
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

   const loadMoreHotels = () => {
  setVisibleCount((prev) => prev + 6);
   };
   /*  useEffect(() => {
    if (!location.state) {
      fetchAllHotels();
    }
  }, []); */
  useEffect(() => {
  fetchAllHotels();
}, [location.search]); // ✅ ADD THIS

  const fetchAllHotels = async () => {
    try {
     /*  const data = await searchHotels({});
      setHotels(data); */
    const params = new URLSearchParams(location.search);

    const filters = {
      district: params.get("district"),
    };

    const data = await searchHotels(filters);
    setHotels(data);

      if (isLoggedIn()) {
        const wishData = await getWishlist();
        setWishlist(wishData.map((h) => String(h._id))); // store only ids
      }
    } catch (err) {
      console.error(err);
    }
  };

   /* useEffect(() => {
    const fetchData = async () => {
      const hotelData = await getHotels();
      setHotels(hotelData);

      if (isLoggedIn()) {
        const wishData = await getWishlist();
        setWishlist(wishData.map((h) => String(h._id))); // store only ids
      }
    };

    fetchData();
  }, []); */

  const applyFilters = async () => {
    /* try {
      const data = await searchHotels(filters);
      setHotels(data);
    } catch (err) {
      console.error(err);
    } */

       try {
    const params = new URLSearchParams(location.search);

    // ✅ always keep district from URL
    const districtFromURL = params.get("district");

    const finalFilters = {
      ...filters,
      district: districtFromURL || filters.district,
    };

    // ✅ remove empty values
    Object.keys(finalFilters).forEach(
      (key) =>
        (!finalFilters[key] || finalFilters[key] === "") &&
        delete finalFilters[key]
    );

    const data = await searchHotels(finalFilters);
    setHotels(data);
  } catch (err) {
    console.error(err);
  }
  };
   
  // ✅ FIX: normalize whatever toggleWishlist returns → always store IDs only
  const handleSetWishlist = (updated) => {
    if (!Array.isArray(updated)) return;
    const ids = updated.map((item) =>
      typeof item === "object" ? String(item._id) : String(item)
    );
    setWishlist(ids);
  };
/*   const applyFilters = async () => {
    const data = await searchHotels(filters);
    setHotels(data);
  }; */

  return (
  <>
    {/* Navbar */}
    <div className="fixed top-0 right-0 left-0 z-50 bg-white shadow-md h-16">
      <Hotelnav />
    </div>

    {/* Main Page */}
    <div className="pt-20 mt-7 px-4 max-w-7xl mx-auto min-h-screen">

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <div className="
          w-full
          lg:w-1/4
          lg:sticky
          lg:top-29
          self-start
          bg-white
          z-10
        ">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
          />
        </div>

        {/* Hotels Section */}
        <div className="w-full lg:w-3/4 mt-4">

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">            {hotels.length > 0 ? (
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

          {/* Load More Button */}
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

        </div>
      </div>
    </div>

    {/* Footer */}
    <Footer />
  
  </>
);
}

export default Hotels;