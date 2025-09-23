// server/src/routes/reminders.js
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Reminder = require("../models/Reminder");
const Movie = require("../models/Movie");

const router = express.Router();

// Rate limiting for reminder creation
const createReminderLimiter = {};

// POST /api/reminders - Create a new reminder
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId, releaseDate, channels, email, phone, timezone } = req.body;
    const userId = req.user.id;

    // Rate limiting check (5 reminders per minute per user)
    const now = Date.now();
    const userKey = userId;
    if (!createReminderLimiter[userKey]) {
      createReminderLimiter[userKey] = [];
    }
    
    // Clean old entries
    createReminderLimiter[userKey] = createReminderLimiter[userKey].filter(
      time => now - time < 60000
    );
    
    if (createReminderLimiter[userKey].length >= 5) {
      return res.status(429).json({ message: "Too many reminder requests. Please try again later." });
    }
    
    createReminderLimiter[userKey].push(now);

    // Validate required fields
    if (!movieId || !releaseDate || !channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ message: "Missing required fields: movieId, releaseDate, channels" });
    }

    // Validate channels
    const validChannels = ["email", "sms"];
    if (!channels.every(ch => validChannels.includes(ch))) {
      return res.status(400).json({ message: "Invalid channels. Must be 'email' and/or 'sms'" });
    }

    // Validate email/phone based on channels
    if (channels.includes("email") && !email) {
      return res.status(400).json({ message: "Email is required when email channel is selected" });
    }
    if (channels.includes("sms") && !phone) {
      return res.status(400).json({ message: "Phone is required when SMS channel is selected" });
    }

    // Validate release date is in the future
    const releaseDateObj = new Date(releaseDate);
    if (releaseDateObj <= new Date()) {
      return res.status(400).json({ message: "Release date must be in the future" });
    }

    // Get movie title from database or request
    let movieTitle = req.body.movieTitle;
    if (!movieTitle) {
      const movie = await Movie.findOne({ id: movieId });
      movieTitle = movie ? movie.title : `Movie ${movieId}`;
    }

    // Check if reminder already exists for this user and movie
    const existingReminder = await Reminder.findOne({ userId, movieId });
    if (existingReminder) {
      // Update existing reminder
      existingReminder.channels = channels;
      existingReminder.email = email;
      existingReminder.phone = phone;
      existingReminder.timezone = timezone || "Australia/Sydney";
      existingReminder.status = "active";
      await existingReminder.save();
      
      return res.json({ 
        message: "Reminder updated successfully", 
        reminder: existingReminder 
      });
    }

    // Create new reminder
    const reminder = new Reminder({
      userId,
      movieId,
      movieTitle,
      releaseDate: releaseDateObj,
      channels,
      email,
      phone,
      timezone: timezone || "Australia/Sydney"
    });

    await reminder.save();

    res.status(201).json({ 
      message: "Reminder created successfully", 
      reminder 
    });
  } catch (err) {
    console.error("POST /api/reminders error:", err);
    res.status(500).json({ message: "Failed to create reminder" });
  }
});

// GET /api/reminders/mine - Get user's reminders
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reminders = await Reminder.find({ 
      userId, 
      status: "active",
      releaseDate: { $gt: new Date() } // Only future reminders
    }).sort({ releaseDate: 1 });

    res.json(reminders);
  } catch (err) {
    console.error("GET /api/reminders/mine error:", err);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

// DELETE /api/reminders/:movieId - Cancel a reminder
router.delete("/:movieId", requireAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndUpdate(
      { userId, movieId: parseInt(movieId) },
      { status: "cancelled" },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder cancelled successfully" });
  } catch (err) {
    console.error("DELETE /api/reminders/:movieId error:", err);
    res.status(500).json({ message: "Failed to cancel reminder" });
  }
});

module.exports = router;