import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHotelById } from "../services/hotelservice";
import ImageGallery from "../component/ImageGallery";
import ReviewForm from "../component/ReviewForm";
import ReviewList from "../component/ReviewList";
import BookingForm from "../component/BookingForm";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";
import ChatBot from "../component/ChatBot";
// ── ADD: import skeleton ──────────────────────────────────────
import { HotelDetailSkeleton } from "../component/Skeleton";

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);

  // ── ADD: loading state ────────────────────────────────────
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotel();
  }, []);

  const user = sessionStorage.getItem("user");

  useEffect(() => {
    fetchReviews();
  }, [id, user]);

  const fetchHotel = async () => {
    // ── ADD: set loading before fetch ────────────────────
    setLoading(true);
    try {
      const data = await getHotelById(id);
      setHotel(data);
    } catch (err) {
      console.error(err);
    } finally {
      // ── ADD: set loading false after fetch ────────────
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${id}`);
    const data = await res.json();
    setReviews(data);
    fetchHotel();
  };

  // ── ONLY CHANGE: replace "Loading..." with skeleton ──────
  if (loading) return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>
      <div className="mt-20">
        <HotelDetailSkeleton />
      </div>
    </>
  );

  // ── Everything below is UNCHANGED ────────────────────────
  return (
    <>
      {/* Navbar */}
      <div className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>

      {/* Title */}
      <div className="flex items-center justify-center mt-24 px-4">
        <p className="text-lg md:text-xl font-bold mt-6 text-gray-700 bg-amber-400 px-4 py-2 rounded-lg hover:bg-green-500 cursor-pointer transition">
          Hotel Details
        </p>
      </div>

      <hr className="my-4 w-3/4 mx-auto" />

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto p-4 flex flex-col lg:flex-row items-start justify-center gap-6">

        {/* Hotel Details Card */}
        <div className="w-full lg:w-2/3 bg-white p-5 rounded shadow cursor-pointer hover:shadow-lg transition-transform duration-300">

          <ImageGallery images={hotel?.images || []} />

          <h1 className="text-xl md:text-2xl font-bold mt-4">{hotel?.name}</h1>
          <p>{hotel?.address}</p>
          <p className="text-sm text-gray-600">{hotel?.district}, {hotel?.state}</p>
          <p className="mt-2 font-semibold text-lg">₹{hotel?.pricePerNight}</p>
          <p>⭐ {hotel?.averageRating?.toFixed(1) || "0.0"}</p>
          <span className="text-gray-500 text-sm">({hotel.totalReviews || 0} reviews)</span>

          {/* Amenities */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {hotel?.amenities?.map((a, i) => (
              <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">{a}</span>
            ))}
          </div>

          {/* Book Now Button */}
          <button
            onClick={() => navigate(`/booking/${hotel?._id}`)}
            className="bg-green-600 text-white px-6 py-2 mt-4 rounded hover:bg-green-700 transition"
          >
            Book Now
          </button>

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-lg md:text-xl font-bold mb-2">Reviews</h2>
            <ReviewForm hotelId={id} reviews={reviews} onReviewAdded={fetchReviews} />
            <ReviewList reviews={reviews} onReviewAdded={fetchReviews} />
          </div>
        </div>

        {/* Booking Form */}
        <div className="w-full lg:w-1/3">
          <BookingForm hotel={hotel} />
        </div>
      </div>

      <Footer />
      <ChatBot />
    </>
  );
}

export default HotelDetails;