import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();

  const getYear = (dateStr) => (dateStr ? new Date(dateStr).getFullYear() : "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={() => navigate(`/movies/${movie._id}`)}
      className="
        group flex flex-col rounded-3xl overflow-hidden cursor-pointer
        bg-white/70 backdrop-blur-xl border border-white/30
        shadow-lg hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 h-full
      "
    >
      {/* Poster */}
      <div className="relative overflow-hidden">
        <img
          src={movie.posterUrl || "/fallback.jpg"}
          alt={movie.title}
          className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {movie.voteAverage > 0 && (
          <p className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-yellow-400 font-bold py-1 px-3 rounded-full text-sm flex items-center gap-1">
            ⭐ {movie.voteAverage.toFixed(1)}
          </p>
        )}
        {movie.releaseDate && (
          <p className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white font-medium py-1 px-3 rounded-full text-xs">
            {getYear(movie.releaseDate)}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="font-bold text-lg truncate">{movie.title}</h2>
        {movie.genres?.length > 0 && (
          <p className="text-gray-500 text-sm mt-1 truncate">{movie.genres.slice(0, 3).join(" · ")}</p>
        )}
        {movie.runtimeMinutes && (
          <p className="text-gray-400 text-xs mt-1">
            {Math.floor(movie.runtimeMinutes / 60)}h {movie.runtimeMinutes % 60}m
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={(e) => { e.stopPropagation(); navigate(`/movies/${movie._id}`); }}
          className="mt-auto pt-4"
        >
          <span className="block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium">
            Book Tickets
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default MovieCard;