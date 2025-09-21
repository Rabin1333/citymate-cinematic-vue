// server/src/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // IMPORTANT: use "id" in token payload to match middleware (requireAuth)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    // IMPORTANT: return "_id" in the user object to match frontend types
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
