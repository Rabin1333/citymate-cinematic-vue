const mongoose = require("mongoose");

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["snacks", "drinks", "combos"]
  },
  image: {
    type: String,
    default: "/food/placeholder.jpg"
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FoodItem", FoodItemSchema);