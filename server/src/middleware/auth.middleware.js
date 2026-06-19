const { verifyToken } = require("../utils/jwt.utils");
const User = require("../models/User.model");

/**
 * Protect routes — only authenticated users can access.
 * Reads the Bearer token from Authorization header.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach user to request (excluding password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

module.exports = { protect };
