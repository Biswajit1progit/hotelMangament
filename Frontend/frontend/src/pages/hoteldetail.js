import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHotelById } from "../services/hotelservice";
import { getReviews } from "../services/reviewserve"; // ⚠️ ADJUST THIS PATH to wherever reviewApi.js actually lives
import ImageGallery from "../component/ImageGallery";
import ReviewForm from "../component/ReviewForm";
import ReviewList from "../component/ReviewList";
import BookingForm from "../component/BookingForm";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";
import ChatBot from "../component/ChatBot";
import HotelMap from "../component/HotelMap";
import { HotelDetailSkeleton } from "../component/Skeleton";

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Measure the navbar's real rendered height so page content always
  // clears it exactly — no matter how Hotelnav's own padding/margins
  // change, this stays correct instead of guessing a fixed pt-24. ──
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(96); // sane fallback before measured

  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current;

    const measure = () => setNavHeight(el.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchHotel();
  }, []);

  const user = sessionStorage.getItem("user");

  useEffect(() => {
    fetchReviews();
  }, [id, user]);

  const fetchHotel = async () => {
    setLoading(true);
    try {
      const data = await getHotelById(id);
      setHotel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED — was a raw fetch() with no headers at all, so it never sent
  // an Authorization token (hence the "NO_TOKEN" 401). Now routes through
  // getReviews() from reviewApi.js, which uses the shared axios instance
  // (apiClient.js) that attaches the in-memory access token automatically
  // and gets silent-refresh-on-401 for free.
  const fetchReviews = async () => {
    try {
      const { data } = await getReviews(id);
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      fetchHotel();
    }
  };

  if (loading) return (
    <>
      <div ref={navRef} className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>
      <div style={{ paddingTop: navHeight }}>
        <HotelDetailSkeleton />
      </div>
    </>
  );

  return (
    <>
      {/* Navbar */}
      <div ref={navRef} className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>

      {/* ── Ambient gradient backdrop — fixed behind everything, isolated
          to its own stacking context so it never interferes with the
          navbar/map z-index fixes elsewhere on this page. ──────────── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
      <div className="fixed top-0 left-1/4 w-96 h-96 -z-10 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl" />
      <div className="fixed top-1/3 right-0 w-96 h-96 -z-10 bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-3xl" />

      <div className="min-h-screen dark:bg-slate-950" style={{ paddingTop: navHeight }}>

        {/* ── Breadcrumb / context strip ─────────────────────── */}
        <div className="pt-4 px-4 sm:px-6 max-w-6xl mx-auto">
          <button
            onClick={() => {
              // Go back in history only if we arrived from within this app
              // (e.g. from the hotel listing page). Otherwise — direct link,
              // page refresh, or new tab — history may have nothing useful
              // behind it, or worse, send you to an unrelated previous page.
              // Falling back to the listing route guarantees a sane result.
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/hotels");
              }
            }}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to results
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            ROW 1 — Hero: gallery + key info, glass card, blue accent
            ══════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className="
              bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl backdrop-saturate-150
              rounded-2xl shadow-lg shadow-blue-100/50 dark:shadow-none border border-white/60 dark:border-slate-800
              p-5 sm:p-7 flex flex-col lg:flex-row gap-6
              animate-[fadeInUp_0.6s_ease-out]
              transition-shadow duration-500 hover:shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-none
            "
          >

            {/* Gallery — left */}
            <div className="w-full lg:w-3/5 rounded-xl overflow-hidden">
              <ImageGallery images={hotel?.images || []} />
            </div>

            {/* Key info — right */}
            <div className="w-full lg:w-2/5 flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                {hotel?.name}
              </h1>
              <p className="mt-1.5 text-gray-600 dark:text-slate-300">{hotel?.address}</p>
              <p className="text-sm text-gray-400 dark:text-slate-400">{hotel?.district}, {hotel?.state}</p>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-2.5 py-1 rounded-md shadow-sm border dark:border-emerald-800">
                  ⭐ {hotel?.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-400 dark:text-slate-400 text-sm">
                  ({hotel?.totalReviews || 0} reviews)
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-100/70 dark:border-slate-800">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  ₹{hotel?.pricePerNight}
                </p>
                <p className="text-sm text-gray-400 dark:text-slate-400">per night</p>
              </div>

              {/* Amenities */}
              {hotel?.amenities?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-100/70 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    Amenities
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {hotel.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="
                          bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium
                          border border-gray-200/80 dark:border-slate-700 shadow-sm
                          transition-all duration-300 ease-out
                          hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-600 hover:scale-105 hover:shadow-md
                        "
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sub-row: Reviews (scrollable, left) + Location map (right) ──
              Glass card, amber/teal accent to visually separate this row
              from the hero above it. Sits inside the same hero card area,
              spanning full width. ──────────────────────────────────── */}
          <div
            className="
              bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl backdrop-saturate-150
              rounded-2xl shadow-lg shadow-violet-100/50 dark:shadow-none border border-white/60 dark:border-slate-800
              mt-6 p-5 sm:p-7 flex flex-col lg:flex-row gap-6
              animate-[fadeInUp_0.6s_ease-out_0.1s]
              transition-shadow duration-500 hover:shadow-xl hover:shadow-violet-200/40 dark:hover:shadow-none
            "
          >

            {/* Reviews — left, scrollable so the row height stays in check
                even with many reviews */}
            <div className="w-full lg:w-3/5 flex flex-col">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
                Guest Reviews
              </h2>
              <ReviewForm hotelId={id} reviews={reviews} onReviewAdded={fetchReviews} />
              <div className="mt-4 max-h-96 overflow-y-auto pr-2 -mr-2 scroll-smooth">
                <ReviewList reviews={reviews} onReviewAdded={fetchReviews} />
              </div>
            </div>

            {/* Location — right. `isolate` traps any internal z-index from
                the map library (Leaflet/Google Maps panes routinely use
                z-index 400–1000+) inside this box, so it can never climb
                above the navbar (z-50) on scroll. */}
            <div className="w-full lg:w-2/5 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-full" />
                Location
              </h3>
              <div className="relative isolate z-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner h-72 lg:h-auto lg:flex-1 ring-1 ring-white/50 dark:ring-slate-800">
                <HotelMap location={hotel.location} name={hotel.name} />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ROW 2 — Guest details, full width, vertical layout
            Glass card, emerald accent
            ══════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          <div
            className="
              bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl backdrop-saturate-150
              rounded-2xl shadow-lg shadow-emerald-100/50 dark:shadow-none border border-white/60 dark:border-slate-800
              p-5 sm:p-7
              animate-[fadeInUp_0.6s_ease-out_0.2s]
              transition-shadow duration-500 hover:shadow-xl hover:shadow-emerald-200/40 dark:hover:shadow-none
            "
          >
            <BookingForm hotel={hotel} />
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />

      {/* Entrance animation keyframes — scoped via Tailwind's arbitrary
          animate-[...] syntax above; the @keyframes definition itself
          still needs to be registered, so it's injected once here. */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default HotelDetails;