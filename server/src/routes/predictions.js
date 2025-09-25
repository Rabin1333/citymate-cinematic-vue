// server/src/routes/predictions.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Prediction = require("../models/Prediction");
const Movie = require("../models/Movie");
const Reward = require("../models/Reward");

// Rate limiting for predictions
const predictionAttempts = new Map();

// Helper function to check if movie is released (predictions locked after release)
const isMovieReleased = async (movieId) => {
  try {
    const movie = await Movie.findById(movieId).select('releaseDate status');
    if (!movie) return true; // Default to locked if movie not found
    
    if (movie.status === 'now-showing') return true; // Already showing
    
    if (movie.releaseDate) {
      const releaseDate = new Date(movie.releaseDate);
      return new Date() >= releaseDate;
    }
    
    return false; // Coming soon with no release date
  } catch (error) {
    console.error('Error checking movie release status:', error);
    return true; // Default to locked on error
  }
};

// POST /api/predictions - Create or update prediction for a movie
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId, predictionText } = req.body;
    const userId = req.user.id;

    // Rate limiting: max 5 predictions per minute per user
    const userKey = `${userId}-prediction`;
    const now = Date.now();
    const attempts = predictionAttempts.get(userKey) || [];
    const recentAttempts = attempts.filter(time => now - time < 60000);
    
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ message: "Too many prediction attempts. Please wait a minute." });
    }
    
    recentAttempts.push(now);
    predictionAttempts.set(userKey, recentAttempts);

    // Validate required fields
    if (!movieId || !predictionText?.trim()) {
      return res.status(400).json({ message: "Movie ID and prediction text are required" });
    }

    // Check if movie is released (predictions locked after release)
    const movieReleased = await isMovieReleased(movieId);
    if (movieReleased) {
      return res.status(400).json({ message: "Predictions are locked after movie release" });
    }

    // Check if prediction already exists for this user/movie
    let prediction = await Prediction.findOne({ userId, movieId });
    
    if (prediction) {
      // Update existing prediction
      if (prediction.isWinner) {
        return res.status(400).json({ message: "Cannot modify winning prediction" });
      }
      
      prediction.predictionText = predictionText.trim();
      await prediction.save();
      
      res.json({ 
        message: "Prediction updated successfully",
        prediction: {
          _id: prediction._id,
          predictionText: prediction.predictionText,
          createdAt: prediction.createdAt,
          updatedAt: prediction.updatedAt,
          isWinner: prediction.isWinner
        }
      });
    } else {
      // Create new prediction
      prediction = new Prediction({
        userId,
        movieId,
        predictionText: predictionText.trim()
      });
      
      await prediction.save();
      
      res.status(201).json({ 
        message: "Prediction created successfully",
        prediction: {
          _id: prediction._id,
          predictionText: prediction.predictionText,
          createdAt: prediction.createdAt,
          updatedAt: prediction.updatedAt,
          isWinner: prediction.isWinner
        }
      });
    }
  } catch (err) {
    console.error("POST /api/predictions error:", err);
    if (err.code === 11000) {
      res.status(409).json({ message: "Prediction already exists for this movie" });
    } else {
      res.status(500).json({ message: "Failed to save prediction" });
    }
  }
});

// GET /api/predictions/movie/:movieId - Get predictions for a movie (admin only)
router.get("/movie/:movieId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { movieId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const predictions = await Prediction.find({ movieId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Prediction.countDocuments({ movieId });

    res.json({
      predictions,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: (Number(page) * Number(limit)) < total
      }
    });
  } catch (err) {
    console.error("GET /api/predictions/movie/:movieId error:", err);
    res.status(500).json({ message: "Failed to fetch movie predictions" });
  }
});

// GET /api/predictions/my - Get current user's predictions
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const predictions = await Prediction.find({ userId })
      .populate('movieId', 'title poster status releaseDate')
      .populate('rewardId', 'rewardType rewardValue rewardDetails status')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Prediction.countDocuments({ userId });

    res.json({
      predictions,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: (Number(page) * Number(limit)) < total
      }
    });
  } catch (err) {
    console.error("GET /api/predictions/my error:", err);
    res.status(500).json({ message: "Failed to fetch user predictions" });
  }
});

// PUT /api/predictions/:id/winner - Mark prediction as winner (admin only)
router.put("/:id/winner", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const prediction = await Prediction.findById(id).populate('userId', 'name email');
    
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    if (prediction.isWinner) {
      return res.status(400).json({ message: "Prediction already marked as winner" });
    }

    // Create reward for winner
    const reward = new Reward({
      userId: prediction.userId._id,
      bookingId: null, // Special case for prediction rewards
      rewardType: "points",
      rewardValue: "200",
      rewardDetails: "200 Loyalty Points for winning prediction contest!"
    });

    await reward.save();

    // Update prediction
    prediction.isWinner = true;
    prediction.rewardId = reward._id;
    await prediction.save();

    res.json({ 
      message: "Prediction marked as winner and reward issued",
      prediction: {
        _id: prediction._id,
        isWinner: prediction.isWinner,
        rewardId: prediction.rewardId
      }
    });
  } catch (err) {
    console.error("PUT /api/predictions/:id/winner error:", err);
    res.status(500).json({ message: "Failed to mark prediction as winner" });
  }
});

// DELETE /api/predictions/:id - Delete user's prediction (before release only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const prediction = await Prediction.findOne({ _id: id, userId });
    
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    if (prediction.isWinner) {
      return res.status(400).json({ message: "Cannot delete winning prediction" });
    }

    // Check if movie is released
    const movieReleased = await isMovieReleased(prediction.movieId);
    if (movieReleased) {
      return res.status(400).json({ message: "Cannot delete prediction after movie release" });
    }

    await Prediction.findByIdAndDelete(id);
    
    res.json({ message: "Prediction deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/predictions/:id error:", err);
    res.status(500).json({ message: "Failed to delete prediction" });
  }
});

// GET /api/predictions/stats - Get prediction statistics (admin only)
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalPredictions = await Prediction.countDocuments();
    const winningPredictions = await Prediction.countDocuments({ isWinner: true });
    const recentPredictions = await Prediction.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalPredictions,
      winningPredictions,
      recentPredictions,
      winRate: totalPredictions > 0 ? (winningPredictions / totalPredictions * 100).toFixed(1) : 0
    });
  } catch (err) {
    console.error("GET /api/predictions/stats error:", err);
    res.status(500).json({ message: "Failed to fetch prediction statistics" });
  }
});

module.exports = router;