// server/src/routes/rewards.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Reward = require("../models/Reward");
const Booking = require("../models/Booking");

// Helper function to check premium seats
function countPremiumSeats(seats) {
  // Premium seats are in rows C, D, E (based on SeatSelection.tsx logic)
  const premiumRows = ['C', 'D', 'E'];
  return seats.filter(seatId => {
    const row = seatId.charAt(0); // First character is the row
    return premiumRows.includes(row);
  }).length;
}

// Helper function to generate random reward
function generateRandomReward() {
  const rewards = [
    {
      type: "freeItem",
      value: "POPCORN_FREE",
      details: "Free Large Popcorn - Code: POP" + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    {
      type: "freeItem", 
      value: "DRINK_FREE",
      details: "Free Large Drink - Code: DRK" + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    {
      type: "discount",
      value: "10",
      details: "10% off your next booking - Code: SAVE" + Math.random().toString(36).substr(2, 4).toUpperCase()
    },
    {
      type: "discount",
      value: "15", 
      details: "15% off your next booking - Code: SAVE" + Math.random().toString(36).substr(2, 4).toUpperCase()
    },
    {
      type: "upgrade",
      value: "PREMIUM_UPGRADE",
      details: "Free seat upgrade to Premium - Code: UP" + Math.random().toString(36).substr(2, 6).toUpperCase()
    },
    {
      type: "points",
      value: "500",
      details: "500 Loyalty Points added to your account"
    },
    {
      type: "points",
      value: "1000", 
      details: "1000 Loyalty Points added to your account"
    }
  ];

  return rewards[Math.floor(Math.random() * rewards.length)];
}

// POST /api/rewards/spin - Spin the wheel for a booking
router.post("/spin", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if booking is confirmed/paid
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Booking must be confirmed to spin" });
    }

    // Check if reward already exists for this booking
    const existingReward = await Reward.findOne({ bookingId });
    if (existingReward) {
      return res.status(400).json({ 
        message: "Reward already claimed for this booking",
        reward: existingReward
      });
    }

    // Check premium seat eligibility (≥3 premium seats)
    const premiumSeatsCount = countPremiumSeats(booking.seats);
    if (premiumSeatsCount < 3) {
      return res.status(400).json({ 
        message: "Booking must have at least 3 premium seats to spin",
        premiumSeats: premiumSeatsCount
      });
    }

    // Generate random reward
    const randomReward = generateRandomReward();

    // Create reward
    const reward = new Reward({
      userId: req.user.id,
      bookingId,
      rewardType: randomReward.type,
      rewardValue: randomReward.value,
      rewardDetails: randomReward.details
    });

    await reward.save();

    res.status(201).json({
      success: true,
      reward: {
        type: reward.rewardType,
        value: reward.rewardValue,
        details: reward.rewardDetails,
        status: reward.status,
        expiryDate: reward.expiryDate
      }
    });

  } catch (err) {
    console.error("POST /api/rewards/spin error:", err);
    res.status(500).json({ message: "Failed to process reward spin" });
  }
});

// GET /api/rewards/by-booking/:id - Get reward for a booking
router.get("/by-booking/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking belongs to user (for security)
    const booking = await Booking.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const reward = await Reward.findOne({ bookingId: id });
    
    if (!reward) {
      return res.status(404).json({ message: "No reward found for this booking" });
    }

    res.json({
      type: reward.rewardType,
      value: reward.rewardValue,
      details: reward.rewardDetails,
      status: reward.status,
      expiryDate: reward.expiryDate,
      createdAt: reward.createdAt
    });

  } catch (err) {
    console.error("GET /api/rewards/by-booking error:", err);
    res.status(500).json({ message: "Failed to fetch reward" });
  }
});

// GET /api/rewards/mine - Get all rewards for current user
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { userId: req.user.id };
    if (status && ['issued', 'claimed', 'expired'].includes(status)) {
      filter.status = status;
    }

    const rewards = await Reward.find(filter)
      .populate({
        path: 'bookingId',
        select: 'bookingReference movieId showtime cinema createdAt',
        populate: {
          path: 'movieId',
          select: 'title poster'
        }
      })
      .sort({ createdAt: -1 });

    res.json(rewards);

  } catch (err) {
    console.error("GET /api/rewards/mine error:", err);
    res.status(500).json({ message: "Failed to fetch user rewards" });
  }
});

module.exports = router;