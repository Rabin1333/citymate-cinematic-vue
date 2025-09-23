// server/src/routes/theaters.js - NEW FILE
const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Mock theater data (you can create a Theater model later)
let theaters = [
  { _id: "1", name: "Downtown Cinema", location: "Downtown", capacity: 250, amenities: ["IMAX", "Parking"] },
  { _id: "2", name: "Mall Cinema", location: "Shopping District", capacity: 180, amenities: ["Standard"] }
];

// GET /api/theaters
router.get("/", async (req, res) => {
  res.json(theaters);
});

// POST /api/theaters
router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  const newTheater = {
    _id: String(Date.now()),
    ...req.body
  };
  theaters.push(newTheater);
  res.status(201).json(newTheater);
});

// PUT /api/theaters/:id
router.put("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  const index = theaters.findIndex(t => t._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Theater not found" });
  
  theaters[index] = { ...theaters[index], ...req.body };
  res.json(theaters[index]);
});

// DELETE /api/theaters/:id
router.delete("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  theaters = theaters.filter(t => t._id !== req.params.id);
  res.json({ message: "Theater deleted" });
});

module.exports = router;