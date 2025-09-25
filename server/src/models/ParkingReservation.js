// server/src/models/ParkingReservation.js
const mongoose = require("mongoose");

const ParkingReservationSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["held", "confirmed", "released", "cancelled"],
    default: "held"
  },
  holdExpiresAt: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
ParkingReservationSchema.index({ bookingId: 1 });
ParkingReservationSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model("ParkingReservation", ParkingReservationSchema);