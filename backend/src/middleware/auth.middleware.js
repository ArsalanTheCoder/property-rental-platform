const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Authentication middleware that verifies access token from httpOnly cookie or Bearer header.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check accessToken from cookies
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    // Verify token signature, expiry, and token type
    const decoded = verifyAccessToken(token);

    // Fetch user from DB
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, "User account no longer exists.");
    }

    // Verify account state
    if (user.isBlocked) {
      throw new ApiError(403, "Account is disabled/blocked. Please contact support.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated.");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Email not verified. Please check your inbox.");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
