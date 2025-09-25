// server/src/routes/parking.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const ParkingLot = require("../models/ParkingLot");
const ParkingReservation = require("../models/ParkingReservation");
const Booking = require("../models/Booking");

// Rate limiting map for parking reservations
const reservationAttempts = new Map();

// GET /api/parking/lots - Get available parking lots for cinema/showtime
router.get("/lots", async (req, res) => {
  try {
    const { cinemaId = "downtown", showtime } = req.query;
    
    if (!showtime) {
      return res.status(400).json({ message: "Showtime is required" });
    }

    // Parse showtime and calculate parking window
    const showtimeDate = new Date(showtime);
    const startTime = new Date(showtimeDate.getTime() - 30 * 60 * 1000); // 30 min before
    const endTime = new Date(showtimeDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours after

    const lots = await ParkingLot.find({ cinemaId, active: true });
    
    const availability = await Promise.all(lots.map(async (lot) => {
      // Count confirmed reservations that overlap with the requested time window
      const overlappingReservations = await ParkingReservation.countDocuments({
        lotId: lot._id,
        status: { $in: ["held", "confirmed"] },
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });

      const available = Math.max(0, lot.capacity - overlappingReservations);
      
      return {
        lotId: lot._id,
        name: lot.name,
        location: lot.location,
        available,
        capacity: lot.capacity,
        priceHint: `$${lot.pricePerHour}/hr`
      };
    }));

    res.json(availability);
  } catch (err) {
    console.error("GET /api/parking/lots error:", err);
    res.status(500).json({ message: "Failed to fetch parking lots" });
  }
});

// POST /api/parking/reservations/hold - Hold a parking spot
router.post("/reservations/hold", requireAuth, async (req, res) => {
  try {
    const { bookingId, lotId, startTime, endTime } = req.body;
    const userId = req.user.id;

    // Rate limiting: max 5 attempts per minute per user
    const userKey = `${userId}-hold`;
    const now = Date.now();
    const attempts = reservationAttempts.get(userKey) || [];
    const recentAttempts = attempts.filter(time => now - time < 60000);
    
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ message: "Too many reservation attempts. Please wait a minute." });
    }
    
    recentAttempts.push(now);
    reservationAttempts.set(userKey, recentAttempts);

    // Validate required fields
    if (!bookingId || !lotId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate booking belongs to user
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate parking lot exists
    const lot = await ParkingLot.findOne({ _id: lotId, active: true });
    if (!lot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate time range
    if (start >= end) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // Check availability for the requested time window
    const overlappingReservations = await ParkingReservation.countDocuments({
      lotId,
      status: { $in: ["held", "confirmed"] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingReservations >= lot.capacity) {
      return res.status(409).json({ message: "Parking lot is full for the requested time" });
    }

    // Calculate price (duration in hours * rate)
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.ceil(durationMs / (60 * 60 * 1000));
    const price = durationHours * lot.pricePerHour;

    // Remove any existing holds for this booking
    await ParkingReservation.deleteMany({
      bookingId,
      status: "held"
    });

    // Create new hold (expires in 15 minutes)
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    const reservation = new ParkingReservation({
      bookingId,
      userId,
      lotId,
      startTime: start,
      endTime: end,
      status: "held",
      holdExpiresAt,
      price
    });

    await reservation.save();
    await reservation.populate("lotId", "name location");

    res.status(201).json({
      reservationId: reservation._id,
      lotName: reservation.lotId.name,
      location: reservation.lotId.location,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      price: reservation.price,
      holdExpiresAt: reservation.holdExpiresAt,
      message: "Parking spot held successfully"
    });
  } catch (err) {
    console.error("POST /api/parking/reservations/hold error:", err);
    res.status(500).json({ message: "Failed to hold parking spot" });
  }
});

// PUT /api/parking/reservations/:id/confirm - Confirm a parking reservation
router.put("/reservations/:id/confirm", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const reservationId = req.params.id;
    const userId = req.user.id;

    // Find the reservation
    const reservation = await ParkingReservation.findOne({
      _id: reservationId,
      userId,
      status: "held"
    });

    if (!reservation) {
      return res.status(404).json({ message: "Parking reservation not found or already confirmed" });
    }

    // Check if hold has expired
    if (new Date() > reservation.holdExpiresAt) {
      await ParkingReservation.findByIdAndUpdate(reservationId, { status: "released" });
      return res.status(410).json({ message: "Parking hold has expired" });
    }

    // Validate booking
    if (bookingId && reservation.bookingId.toString() !== bookingId) {
      return res.status(400).json({ message: "Booking ID mismatch" });
    }

    // Confirm the reservation
    reservation.status = "confirmed";
    await reservation.save();

    res.json({ message: "Parking reservation confirmed successfully" });
  } catch (err) {
    console.error("PUT /api/parking/reservations/:id/confirm error:", err);
    res.status(500).json({ message: "Failed to confirm parking reservation" });
  }
});

// DELETE /api/parking/reservations/:id - Release a parking hold
router.delete("/reservations/:id", requireAuth, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;

    const reservation = await ParkingReservation.findOne({
      _id: reservationId,
      userId,
      status: { $in: ["held", "confirmed"] }
    });

    if (!reservation) {
      return res.status(404).json({ message: "Parking reservation not found" });
    }

    reservation.status = reservation.status === "held" ? "released" : "cancelled";
    await reservation.save();

    res.json({ message: "Parking reservation released successfully" });
  } catch (err) {
    console.error("DELETE /api/parking/reservations/:id error:", err);
    res.status(500).json({ message: "Failed to release parking reservation" });
  }
});

module.exports = router;