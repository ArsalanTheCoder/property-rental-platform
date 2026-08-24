const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Optional authentication middleware.
 * Attaches req.user if a valid token is provided, but does not block unauthenticated requests.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.sub);
        if (user && !user.isBlocked && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid/expired; ignore and proceed as guest
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  optionalAuth,
};
