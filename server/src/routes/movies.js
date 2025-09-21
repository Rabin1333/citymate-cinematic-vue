// server/src/routes/movies.js
const express = require("express");
const Movie = require("../models/Movie");

const router = express.Router();

// GET /api/movies (all movies, or upcoming if query param is true)
router.get("/", async (req, res) => {
  try {
    if (req.query.upcoming === "true") {
      const all = await Movie.find({});
      const now = new Date();
      const upcoming = all.filter(m => {
        if (m.releaseDate) {
          const d = new Date(m.releaseDate);
          return !isNaN(d) && d > now;
        }
        return m.status === "coming-soon";
      });
      return res.json(upcoming);
    }

    const movies = await Movie.find({});
    res.json(movies);
  } catch (err) {
    console.error("GET /api/movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
