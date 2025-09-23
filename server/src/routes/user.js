// server/src/routes/user.js - User profile management routes
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/user/profile - Get user profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/profile - Update user profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ 
      message: "Profile updated successfully", 
      user 
    });
  } catch (err) {
    console.error("PUT /api/user/profile error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// PUT /api/user/change-password - Change user password
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("PUT /api/user/change-password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// PUT /api/user/settings - Update user settings/preferences
router.put("/settings", requireAuth, async (req, res) => {
  try {
    const { notifications, privacy, language, region, theme, currency } = req.body;

    const preferences = {
      notifications: notifications || {
        bookingConfirmations: true,
        promotions: false,
        newReleases: false,
        reminders: true,
      },
      privacy: privacy || {
        profileVisibility: "private",
        shareBookingHistory: false,
        allowRecommendations: true,
      },
      language: language || "en",
      region: region || "US",
      theme: theme || "dark",
      currency: currency || "USD",
    };

    await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    );

    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("PUT /api/user/settings error:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// GET /api/user/bookings - Get user's bookings with movie details
router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("movieId", "title poster duration pricing")
      .sort({ createdAt: -1 });

    // Transform bookings to include movie details and calculated fields
    const enhancedBookings = bookings.map(booking => {
      const movie = booking.movieId;
      return {
        _id: booking._id,
        userId: booking.userId,
        movieId: booking.movieId._id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        showtime: booking.showtime,
        date: booking.createdAt.toISOString().split('T')[0], // Simplified date
        seats: booking.seats,
        cinema: booking.cinema,
        screen: `Screen ${Math.floor(Math.random() * 5) + 1}`, // Mock screen assignment
        status: booking.status,
        bookingReference: booking.bookingReference,
        totalAmount: booking.seats.length * movie.pricing.regular,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });

    res.json(enhancedBookings);
  } catch (err) {
    console.error("GET /api/user/bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// PUT /api/user/bookings/:id/cancel - Cancel a booking
router.put("/bookings/:id/cancel", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    await Booking.findByIdAndUpdate(bookingId, { 
      status: "cancelled",
      updatedAt: new Date()
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("PUT /api/user/bookings/:id/cancel error:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

// GET /api/user/bookings/:id/ticket - Download ticket (returns mock PDF data)
router.get("/bookings/:id/ticket", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    }).populate("movieId", "title");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // In a real implementation, you'd generate a PDF here
    // For now, return a simple text response that can be downloaded
    const ticketContent = `
CINEMA TICKET
=============
Movie: ${booking.movieId.title}
Date: ${new Date(booking.createdAt).toLocaleDateString()}
Time: ${booking.showtime}
Seats: ${booking.seats.join(", ")}
Cinema: ${booking.cinema}
Reference: ${booking.bookingReference}
Status: ${booking.status.toUpperCase()}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.bookingReference}.txt"`);
    res.send(ticketContent);
  } catch (err) {
    console.error("GET /api/user/bookings/:id/ticket error:", err);
    res.status(500).json({ message: "Failed to download ticket" });
  }
});

// POST /api/user/bookings/:id/email - Email ticket
router.post("/bookings/:id/email", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    }).populate("movieId", "title");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = await User.findById(req.user.id);
    
    // In a real implementation, you'd send an actual email here
    // For now, just simulate the email sending
    console.log(`Sending ticket email to ${user.email} for booking ${booking.bookingReference}`);

    res.json({ message: "Ticket has been sent to your email address" });
  } catch (err) {
    console.error("POST /api/user/bookings/:id/email error:", err);
    res.status(500).json({ message: "Failed to email ticket" });
  }
});

// DELETE /api/user/account - Delete user account
router.delete("/account", requireAuth, async (req, res) => {
  try {
    // Cancel all active bookings
    await Booking.updateMany(
      { 
        userId: req.user.id, 
        status: { $in: ["confirmed", "pending"] } 
      },
      { status: "cancelled" }
    );

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/user/account error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;  