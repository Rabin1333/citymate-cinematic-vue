// server/src/routes/movies.js - COMPLETE VERSION
const express = require("express");
const Movie = require("../models/Movie");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/movies
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

// GET /api/movies/:id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/movies - Create movie (admin only)
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: "Movie created", movie });
  } catch (err) {
    res.status(500).json({ message: "Failed to create movie" });
  }
});

// PUT /api/movies/:id - Update movie (admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie updated", movie });
  } catch (err) {
    res.status(500).json({ message: "Failed to update movie" });
  }
});

// DELETE /api/movies/:id - Delete movie (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete movie" });
  }
});

module.exports = router;