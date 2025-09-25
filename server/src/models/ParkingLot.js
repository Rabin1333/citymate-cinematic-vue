// server/src/models/ParkingLot.js
const mongoose = require("mongoose");

const ParkingLotSchema = new mongoose.Schema({
  cinemaId: {
    type: String,
    required: true,
    default: "downtown" // For now, all lots belong to downtown cinema
  },
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 0,
    default: 5 // $5 per hour
  },
  location: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ParkingLot", ParkingLotSchema);