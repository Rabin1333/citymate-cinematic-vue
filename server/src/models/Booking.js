// server/src/models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
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
  showtime: {
    type: String,
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  cinema: {
    type: String,
    default: "Downtown Cinema"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "confirmed"
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  foodItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem"
    },
    quantity: {
      type: Number,
      min: 1
    },
    price: {
      type: Number,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", BookingSchema);