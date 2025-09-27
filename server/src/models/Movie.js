// server/src/models/Movie.js
const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: [String],
  rating: String,
  duration: String,
  releaseYear: String,
  poster: String,
  synopsis: String,
  director: String,
  cast: [String],
  showtimes: [String],                // e.g. "2:30 PM"
  pricing: {
    regular: Number,
    premium: Number,
    vip: Number,
  },
  status: { type: String, enum: ["now-showing", "coming-soon"], default: "now-showing" },
  featured: Boolean,
  // stored as ISO string in seed to match your UI; we'll parse it when filtering
  releaseDate: String,
  trailerUrl: String,
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Movie", MovieSchema);
