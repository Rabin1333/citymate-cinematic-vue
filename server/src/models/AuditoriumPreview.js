// server/src/models/AuditoriumPreview.js
const mongoose = require("mongoose");

const AuditoriumPreviewSchema = new mongoose.Schema({
  auditoriumId: {
    type: String,
    required: true,
    default: "downtown-screen-1" // matches our current cinema structure
  },
  zoneId: {
    type: String,
    required: true,
    enum: ["regular", "premium", "vip"],
    index: true
  },
  url360: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)|(\/assets\/)/.test(v); // Allow HTTP URLs or local assets
      },
      message: 'url360 must be a valid URL or local asset path'
    }
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)|(\/assets\/)/.test(v); // Allow HTTP URLs or local assets, optional
      },
      message: 'videoUrl must be a valid URL or local asset path'
    }
  },
  description: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
AuditoriumPreviewSchema.index({ auditoriumId: 1, zoneId: 1 }, { unique: true });

module.exports = mongoose.model("AuditoriumPreview", AuditoriumPreviewSchema);