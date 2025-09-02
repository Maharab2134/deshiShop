const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Save user (password will be hashed by pre-save hook)
    await user.save();

    // Create JWT token
    const payload = {
      userId: user._id,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📧 Login attempt for email:", email);
    console.log("🔐 Password received:", password);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ User found:", user.email);
    console.log("📋 Stored password hash:", user.password);

    // Check password using the model method
    console.log("🔐 Testing password comparison...");
    const isMatch = await user.comparePassword(password);
    console.log("✅ Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
      userId: user._id,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: "7d",
      }
    );

    console.log("✅ Login successful for:", email);
    console.log("🎫 Token generated");

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
