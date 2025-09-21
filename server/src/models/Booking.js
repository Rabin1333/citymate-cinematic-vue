const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    showtime: {
      type: String,
      required: true, // keep as string to match your UI (e.g. "2:30 PM")
    },
    cinema: {
      type: String,
      default: "Downtown Cinema",
    },
    seats: {
      type: [String],
      required: true, // e.g. ["A1","A2"]
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "pending"],
      default: "confirmed",
    },
    bookingReference: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls before it's set
    },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// Auto-generate booking reference if missing
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference && this.isNew) {
    this.bookingReference =
      "BK" +
      Date.now() +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
