// server/src/routes/showtimes.js
const express = require("express");
const mongoose = require("mongoose");
const Movie = require("../models/Movie");

const router = express.Router();

/**
 * GET /api/showtimes?movieId=...
 * Returns { movieId, title, showtimes: [...] }
 * (Showtimes are stored inside each movie as strings e.g. "2:30 PM")
 */
router.get("/", async (req, res) => {
  try {
    const { movieId } = req.query;
    
    if (!movieId) {
      return res.status(400).json({ message: "movieId is required" });
    }

    // Validate movieId (must be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId format" });
    }

    const movie = await Movie.findById(movieId).select("title showtimes");
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({
      movieId,
      title: movie.title,
      showtimes: movie.showtimes || [],
    });
  } catch (err) {
    console.error("GET /api/showtimes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;