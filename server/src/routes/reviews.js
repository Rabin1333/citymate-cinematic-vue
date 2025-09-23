const express = require("express");
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();
const rateLimit = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const requests = rateLimitMap.get(key);
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ message: "Too many requests, please try again later" });
  }

  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  next();
};

// Helper function to update movie aggregates
async function updateMovieAggregates(movieId) {
  const reviews = await Review.find({ movieId, status: "published" });
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  await Movie.findByIdAndUpdate(movieId, {
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length
  });
}

// Basic profanity filter
function containsProfanity(text) {
  const profanityWords = ['damn', 'shit', 'fuck', 'bitch']; // Basic list
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

// POST /api/reviews - Create review
router.post("/", requireAuth, rateLimit, async (req, res) => {
  try {
    const { movieId, bookingId, rating, comment } = req.body;

    if (!movieId || !rating || !comment) {
      return res.status(400).json({ message: "movieId, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ 
      userId: req.user.id, 
      movieId,
      status: { $ne: "removed" }
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this movie" });
    }

    // Server-side eligibility check
    let isVerified = false;
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        userId: req.user.id,
        status: { $in: ["confirmed", "completed"] }
      });

      if (booking) {
        // Check if showtime has passed
        const showtimeDate = new Date(booking.showtime);
        const now = new Date();
        
        if (showtimeDate < now) {
          isVerified = true;
        }
      }
    }

    // Basic profanity filter
    if (containsProfanity(comment)) {
      return res.status(400).json({ message: "Comment contains inappropriate content" });
    }

    // Sanitize comment
    const sanitizedComment = comment.trim().substring(0, 1000);

    const review = new Review({
      userId: req.user.id,
      movieId,
      bookingId: bookingId || null,
      rating,
      comment: sanitizedComment,
      isVerified,
      status: "published"
    });

    await review.save();
    await updateMovieAggregates(movieId);

    const populatedReview = await Review.findById(review._id)
      .populate("userId", "name")
      .populate("movieId", "title");

    res.status(201).json({ message: "Review created successfully", review: populatedReview });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// PUT /api/reviews/:id - Edit review
router.put("/:id", requireAuth, rateLimit, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findOne({ 
      _id: reviewId,
      userId: req.user.id,
      status: { $ne: "removed" }
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (comment && containsProfanity(comment)) {
      return res.status(400).json({ message: "Comment contains inappropriate content" });
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment.trim().substring(0, 1000);

    await Review.findByIdAndUpdate(reviewId, updates);
    await updateMovieAggregates(review.movieId);

    const updatedReview = await Review.findById(reviewId)
      .populate("userId", "name")
      .populate("movieId", "title");

    res.json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
});

// DELETE /api/reviews/:id - Soft delete review
router.delete("/:id", requireAuth, rateLimit, async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findOne({ 
      _id: reviewId,
      userId: req.user.id,
      status: { $ne: "removed" }
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Review.findByIdAndUpdate(reviewId, { status: "removed" });
    await updateMovieAggregates(review.movieId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// GET /api/reviews - Public reviews with filtering
router.get("/", async (req, res) => {
  try {
    const { movieId, page = 1, pageSize = 10, sort = "recent" } = req.query;
    const limit = Math.min(parseInt(pageSize), 50);
    const skip = (parseInt(page) - 1) * limit;

    let sortOrder = { createdAt: -1 }; // recent
    if (sort === "highest") sortOrder = { rating: -1, createdAt: -1 };
    if (sort === "lowest") sortOrder = { rating: 1, createdAt: -1 };

    const filter = { status: "published" };
    if (movieId) filter.movieId = movieId;

    const reviews = await Review.find(filter)
      .populate("userId", "name")
      .populate("movieId", "title")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// GET /api/reviews/my - Current user's reviews
router.get("/my", requireAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const limit = Math.min(parseInt(pageSize), 50);
    const skip = (parseInt(page) - 1) * limit;

    const reviews = await Review.find({ 
      userId: req.user.id,
      status: { $ne: "removed" }
    })
      .populate("movieId", "title poster")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      userId: req.user.id,
      status: { $ne: "removed" }
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ message: "Failed to fetch your reviews" });
  }
});

module.exports = router;