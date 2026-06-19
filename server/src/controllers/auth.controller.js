const User = require("../models/User.model");
const { generateToken } = require("../utils/jwt.utils");

// ── POST /api/auth/register ──────────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Basic input check
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user,
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

// ── POST /api/auth/login ─────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful!",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

// ── GET /api/auth/me ─────────────────────────────────────────
async function getMe(req, res) {
  // req.user is already populated by the protect middleware
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
