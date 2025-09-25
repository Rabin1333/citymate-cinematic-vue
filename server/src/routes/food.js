const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const FoodItem = require("../models/FoodItem");

// GET /api/food - Get all available food items
router.get("/", async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ available: true }).sort({ category: 1, name: 1 });
    res.json(foodItems);
  } catch (err) {
    console.error("GET /api/food error:", err);
    res.status(500).json({ message: "Failed to fetch food items" });
  }
});

// POST /api/food - Create new food item (admin only)
router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const foodItem = new FoodItem({
      name,
      description,
      price,
      category,
      image: image || "/food/placeholder.jpg"
    });

    await foodItem.save();
    res.status(201).json(foodItem);
  } catch (err) {
    console.error("POST /api/food error:", err);
    res.status(500).json({ message: "Failed to create food item" });
  }
});

// PUT /api/food/:id - Update food item (admin only)
router.put("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const { name, description, price, category, image, available } = req.body;
    
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, image, available },
      { new: true, runValidators: true }
    );

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json(foodItem);
  } catch (err) {
    console.error("PUT /api/food/:id error:", err);
    res.status(500).json({ message: "Failed to update food item" });
  }
});

// DELETE /api/food/:id - Delete food item (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json({ message: "Food item deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/food/:id error:", err);
    res.status(500).json({ message: "Failed to delete food item" });
  }
});

module.exports = router;