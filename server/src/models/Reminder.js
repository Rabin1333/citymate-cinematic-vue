// server/src/models/Reminder.js
const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  movieId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Movie",
  required: true
},
  movieTitle: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  channels: [{
    type: String,
    enum: ["email", "sms"],
    required: true
  }],
  email: {
    type: String,
    required: function() {
      return this.channels.includes("email");
    }
  },
  phone: {
    type: String,
    required: function() {
      return this.channels.includes("sms");
    }
  },
  timezone: {
    type: String,
    default: "Australia/Sydney"
  },
  status: {
    type: String,
    enum: ["active", "sent", "cancelled"],
    default: "active"
  }
}, { 
  timestamps: true 
});

// Create indexes for performance
ReminderSchema.index({ userId: 1, movieId: 1 }, { unique: true });
ReminderSchema.index({ releaseDate: 1, status: 1 });
ReminderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Reminder", ReminderSchema);