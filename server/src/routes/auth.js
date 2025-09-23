// server/src/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Returns: { token, user }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user", // Default role
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    // Return token and user info
    res.status(201).json({
      token,
      user: { 
        _id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      },
    });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check which password field exists
    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) {
      console.log("No password found in user object");
      return res.status(500).json({ message: "Account setup incomplete" });
    }

    const valid = await bcrypt.compare(password, storedPassword);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token (using "id" to match middleware)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    // Return token and user info (using "_id" to match frontend types)
    res.json({
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;