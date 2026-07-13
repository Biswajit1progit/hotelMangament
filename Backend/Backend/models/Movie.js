const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true }, // links back to TMDB, prevents duplicate imports
    title: { type: String, required: true, trim: true },
    overview: { type: String },
    posterPath: { type: String },   // TMDB relative path, e.g. "/abc123.jpg"
    backdropPath: { type: String },
    genres: [{ type: String }],
    releaseDate: { type: Date },
    runtimeMinutes: { type: Number },
    voteAverage: { type: Number, default: 0 }, // TMDB rating, 0-10
    language: { type: String },
    isActive: { type: Boolean, default: true }, // admin can hide without deleting (shows may still reference it)
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text" }); // enables text search on title for the movie listing page

module.exports = mongoose.model("Movie", movieSchema);