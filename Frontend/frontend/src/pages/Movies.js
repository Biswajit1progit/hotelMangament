import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getMovies } from "../services/Movieservice";
import MovieCard from "../component/Moviecard";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (query = "") => {
    setLoading(true);
    try {
      const data = await getMovies(query);
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies(search);
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50" />
      <div className="fixed top-0 left-1/4 w-96 h-96 -z-10 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="fixed top-1/3 right-0 w-96 h-96 -z-10 bg-orange-200/30 rounded-full blur-3xl" />

      <div className="min-h-screen pt-28 px-4 sm:px-6 max-w-7xl mx-auto pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎬 Now Showing</h1>
          <p className="text-gray-500 mt-1">Book your movie tickets in a few taps</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search movies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 bg-white/70 backdrop-blur-md rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-300"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium text-sm">
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🎬</p>
            <p>No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {movies.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Movies;