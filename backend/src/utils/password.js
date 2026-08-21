const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} plainPassword 
 * @returns {Promise<string>}
 */
const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compares a plain-text password with a bcrypt hash.
 * @param {string} plainPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
