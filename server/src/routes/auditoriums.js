// server/src/routes/auditoriums.js
const express = require("express");
const router = express.Router();
const AuditoriumPreview = require("../models/AuditoriumPreview");

// GET /api/auditoriums/:id/previews - Get 360° previews for an auditorium
router.get("/:id/previews", async (req, res) => {
  try {
    const auditoriumId = req.params.id;
    
    if (!auditoriumId) {
      return res.status(400).json({ message: "Auditorium ID is required" });
    }

    const previews = await AuditoriumPreview.find({
      auditoriumId,
      active: true
    }).select('zoneId url360 description').sort({ zoneId: 1 });

    // Always return an array, even if empty
    res.json(previews.map(preview => ({
      zoneId: preview.zoneId,
      url360: preview.url360,
      description: preview.description || ""
    })));
  } catch (err) {
    console.error("GET /api/auditoriums/:id/previews error:", err);
    res.status(500).json({ message: "Failed to fetch auditorium previews" });
  }
});

// GET /api/auditoriums/:id/previews/:zoneId - Get specific zone preview
router.get("/:id/previews/:zoneId", async (req, res) => {
  try {
    const { id: auditoriumId, zoneId } = req.params;
    
    const preview = await AuditoriumPreview.findOne({
      auditoriumId,
      zoneId,
      active: true
    }).select('zoneId url360 description');

    if (!preview) {
      return res.status(404).json({ message: "Preview not found for this zone" });
    }

    res.json({
      zoneId: preview.zoneId,
      url360: preview.url360,
      description: preview.description || ""
    });
  } catch (err) {
    console.error("GET /api/auditoriums/:id/previews/:zoneId error:", err);
    res.status(500).json({ message: "Failed to fetch zone preview" });
  }
});

module.exports = router;