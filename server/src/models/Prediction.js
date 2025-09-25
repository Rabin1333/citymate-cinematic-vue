// server/src/models/Prediction.js
const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
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
  predictionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500 // Keep predictions concise
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reward",
    required: false // Only set when marked as winner
  }
}, {
  timestamps: true
});

// Compound index to ensure one prediction per user per movie
PredictionSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Indexes for performance
PredictionSchema.index({ movieId: 1, createdAt: -1 });
PredictionSchema.index({ userId: 1, createdAt: -1 });
PredictionSchema.index({ isWinner: 1 });

module.exports = mongoose.model("Prediction", PredictionSchema);