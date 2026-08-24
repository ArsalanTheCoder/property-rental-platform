const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("./ApiError");

/**
 * Signs a short-lived access token JWT.
 * @param {Object} payload 
 * @param {string} payload.userId 
 * @param {string} payload.role
 * @returns {string} Signed JWT
 */
const signAccessToken = ({ userId, role }) => {
  return jwt.sign(
    {
      sub: userId,
      role,
      type: "access",
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiry,
    }
  );
};

/**
 * Signs a long-lived refresh token JWT.
 * @param {Object} payload 
 * @param {string} payload.userId 
 * @param {string} [payload.jti] Unique identifier for the token session
 * @returns {string} Signed JWT
 */
const signRefreshToken = ({ userId, jti }) => {
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
      ...(jti ? { jti } : {}),
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiry,
    }
  );
};

/**
 * Verifies and decodes an access token.
 * @param {string} token 
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    if (decoded.type !== "access") {
      throw new ApiError(401, "Invalid token type");
    }
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired");
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid access token");
  }
};

/**
 * Verifies and decodes a refresh token.
 * @param {string} token 
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (decoded.type !== "refresh") {
      throw new ApiError(401, "Invalid token type");
    }
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token has expired");
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid refresh token");
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
