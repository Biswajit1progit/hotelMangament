import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, getShowsForMovie, getTheaters } from "../services/Movieservice";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Next 7 days, for the date-strip selector
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchMovie();
    fetchCities();
  }, [id]);

  useEffect(() => {
    fetchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedCity, selectedDate]);

  const fetchMovie = async () => {
    try {
      const data = await getMovieById(id);
      setMovie(data);
    } catch (err) {
      console.error("Failed to fetch movie:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const theaters = await getTheaters();
      const uniqueCities = [...new Set(theaters.map((t) => t.city))];
      setCities(uniqueCities);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShows = async () => {
    try {
      const data = await getShowsForMovie(id, { city: selectedCity, date: selectedDate });
      setShows(data);
    } catch (err) {
      console.error("Failed to fetch shows:", err);
    }
  };

  // Group shows by theater, so each theater shows all its times together
  const showsByTheater = shows.reduce((acc, show) => {
    const key = show.theater?._id || "unknown";
    if (!acc[key]) acc[key] = { theater: show.theater, shows: [] };
    acc[key].shows.push(show);
    return acc;
  }, {});

  if (loading) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>
        <div className="min-h-screen pt-28 flex items-center justify-center text-gray-400">Loading…</div>
      </>
    );
  }

  if (!movie) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>

      {/* Backdrop hero */}
      <div className="relative h-[380px] w-full -z-10">
        {movie.backdropUrl && (
          <img src={movie.backdropUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-black/40" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-56 relative pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-40 sm:w-56 rounded-2xl shadow-xl border-4 border-white flex-shrink-0"
          />

          {/* Info */}
          <div className="pt-2 md:pt-24">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
              {movie.voteAverage > 0 && <span className="text-yellow-500 font-semibold">⭐ {movie.voteAverage.toFixed(1)}</span>}
              {movie.runtimeMinutes && <span>· {Math.floor(movie.runtimeMinutes / 60)}h {movie.runtimeMinutes % 60}m</span>}
              {movie.releaseDate && <span>· {new Date(movie.releaseDate).getFullYear()}</span>}
            </div>
            {movie.genres?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {movie.genres.map((g) => (
                  <span key={g} className="bg-rose-50 text-rose-600 text-xs font-medium px-3 py-1 rounded-full">{g}</span>
                ))}
              </div>
            )}
            <p className="text-gray-600 text-sm mt-4 max-w-xl leading-relaxed">{movie.overview}</p>
          </div>
        </div>

        {/* Showtime picker */}
        <div className="mt-10 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5 sm:p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select date & city</h2>

          {/* Date strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {dateOptions.map((d) => {
              const dateObj = new Date(d);
              const active = d === selectedDate;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl border transition ${
                    active ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                  }`}
                >
                  <span className="text-xs font-medium">{dateObj.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                  <span className="text-sm font-bold">{dateObj.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* City filter */}
          {cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6"
            >
              <option value="">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* Showtimes grouped by theater */}
          {Object.keys(showsByTheater).length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No shows found for this date/city. Try another date.</p>
          ) : (
            <div className="space-y-5">
              {Object.values(showsByTheater).map(({ theater, shows: theaterShows }) => (
                <div key={theater?._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="font-semibold text-gray-900">{theater?.name}</p>
                  <p className="text-xs text-gray-400 mb-3">{theater?.address}</p>
                  <div className="flex gap-2 flex-wrap">
                    {theaterShows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => navigate(`/movies/show/${show._id}`)}
                        disabled={show.availableSeats === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          show.availableSeats === 0
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {show.showTime}
                        <span className="block text-[10px] mt-0.5 opacity-70">
                          {show.availableSeats === 0 ? "Sold out" : `${show.availableSeats} left`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MovieDetails;