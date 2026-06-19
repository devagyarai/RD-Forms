const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

/**
 * Generate a signed JWT token for a user.
 * Expires in 7 days so users stay logged in reasonably long.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: "7d" });
}

/**
 * Verify a token and return the decoded payload.
 * Throws if the token is invalid or expired.
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
