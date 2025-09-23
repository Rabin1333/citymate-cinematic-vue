// server/src/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["admin", "user"], 
    default: "user" 
  },
  
  // ADD THIS FIELD
  blocked: {
    type: Boolean,
    default: false
  },
  
  // Profile fields
  phone: {
    type: String,
    default: ""
  },
  dateOfBirth: {
    type: Date
  },
  
  // User preferences
  preferences: {
    notifications: {
      bookingConfirmations: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newReleases: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ["public", "friends", "private"], 
        default: "private" 
      },
      shareBookingHistory: { type: Boolean, default: false },
      allowRecommendations: { type: Boolean, default: true }
    },
    language: { type: String, default: "en" },
    region: { type: String, default: "US" },
    theme: { type: String, default: "dark" },
    currency: { type: String, default: "USD" }
  }
}, { 
  timestamps: true 
});

// Create indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Virtual for memberSince (use createdAt)
UserSchema.virtual('memberSince').get(function() {
  return this.createdAt;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("User", UserSchema);