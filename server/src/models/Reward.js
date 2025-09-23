// server/src/models/Reward.js
const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true // One reward per booking
  },
  rewardType: {
    type: String,
    enum: ["discount", "freeItem", "upgrade", "points"],
    required: true
  },
  rewardValue: {
    type: String,
    required: true
  },
  rewardDetails: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["issued", "claimed", "expired"],
    default: "issued"
  },
  expiryDate: {
    type: Date,
    default: function() {
      // Expire in 30 days
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
RewardSchema.index({ userId: 1, status: 1 });
RewardSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Reward", RewardSchema);