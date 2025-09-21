// server/src/routes/bookings.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");

const router = express.Router();

// Middleware: authenticate and set req.user
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = decoded; // {_id, name, role}
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// POST /api/bookings
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { movieId, showtime, seats, cinema } = req.body;

    const booking = new Booking({
      userId: req.user._id,   // ✅ attach logged in user
      movieId,
      showtime,
      seats,
      cinema,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
});

module.exports = router;
