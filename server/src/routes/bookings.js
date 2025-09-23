// server/src/routes/bookings.js - COMPLETE FILE
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Booking = require("../models/Booking");

// POST /api/bookings - Create a new booking
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId, showtime, seats, cinema } = req.body;

    // Validate required fields
    if (!movieId || !showtime || !seats || seats.length === 0) {
      return res.status(400).json({ 
        message: "Missing required fields: movieId, showtime, and seats" 
      });
    }

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Calculate total amount (assuming $14 per seat)
    const totalAmount = seats.length * 14;

    // Create booking
    const booking = new Booking({
      userId: req.user.id,
      movieId,
      showtime,
      seats,
      cinema: cinema || "Downtown Cinema",
      status: "confirmed",
      bookingReference,
      totalAmount
    });

    await booking.save();

    res.status(201).json({ 
      _id: booking._id,
      bookingReference: booking.bookingReference,
      message: "Booking created successfully" 
    });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// GET /api/bookings - Get user's bookings
router.get("/", requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("movieId", "title poster rating duration")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// GET /api/bookings/:id - Get single booking with full details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate("movieId", "title poster rating duration");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (err) {
    console.error("GET /api/bookings/:id error:", err);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

// GET /api/bookings/stats - Admin booking statistics
router.get("/stats", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  // Mock data for now - you can replace with real database queries later
  const stats = {
    totalRevenue: 127456,
    totalTickets: 8432,
    averageOccupancy: 72,
    uniqueVisitors: 3247,
    popularMovies: [
      { title: "Dune", tickets: 1245, revenue: 18675 },
      { title: "The Dark Knight", tickets: 987, revenue: 14805 }
    ],
    genreStats: [
      { genre: "Action", tickets: 1245, revenue: 18675 },
      { genre: "Drama", tickets: 987, revenue: 14805 }
    ],
    timeStats: [
      { hour: "18:00", bookings: 156 },
      { hour: "20:00", bookings: 234 }
    ],
    weeklyStats: [
      { day: "Mon", attendance: 245 },
      { day: "Fri", attendance: 456 }
    ]
  };

  res.json(stats);
});

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("PUT /api/bookings/:id/cancel error:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

module.exports = router;