// server/src/routes/admin.js - Admin user management
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const User = require("../models/User");
const Booking = require("../models/Booking");

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// GET /api/admin/users - Get all users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    
    // Enhance with booking counts
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ userId: user._id });
        const totalSpent = await Booking.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        
        return {
          ...user.toObject(),
          totalBookings: bookingCount,
          totalSpent: totalSpent[0]?.total || 0,
          memberSince: user.createdAt
        };
      })
    );
    
    res.json(usersWithStats);
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /api/admin/users/:id - Get specific user
router.get("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const bookings = await Booking.find({ userId: user._id })
      .populate("movieId", "title")
      .sort({ createdAt: -1 });
    
    res.json({ user, bookings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// PUT /api/admin/users/:id - Update user (change role, etc)
router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("PUT /api/admin/users/:id error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Cancel all user's bookings first
    await Booking.updateMany(
      { userId: req.params.id, status: { $in: ["confirmed", "pending"] } },
      { status: "cancelled" }
    );
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/admin/users/:id error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// PUT /api/admin/users/:id/block - Block/unblock user
router.put("/users/:id/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { blocked } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: blocked || false },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: blocked ? "User blocked" : "User unblocked", 
      user 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// GET /api/admin/stats - Admin dashboard stats
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ blocked: { $ne: true } });
    const totalBookings = await Booking.countDocuments({});
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    res.json({
      totalUsers,
      activeUsers,
      blockedUsers: totalUsers - activeUsers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;