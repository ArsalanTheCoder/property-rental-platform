const crypto = require("crypto");

/**
 * Generates a cryptographically secure random hexadecimal token.
 * @param {number} bytesLength Default is 32 bytes (64 hex characters)
 * @returns {string}
 */
const generateRandomToken = (bytesLength = 32) => {
  return crypto.randomBytes(bytesLength).toString("hex");
};

/**
 * Generates a SHA-256 hash of a raw token string for database storage.
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  if (!token) return "";
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateRandomToken,
  hashToken,
};
