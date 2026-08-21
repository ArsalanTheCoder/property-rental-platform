const rateLimit = require("express-rate-limit");

/**
 * Standard rate limiter for general authentication routes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many attempts. Please try again later.",
    });
  },
});

/**
 * Stricter rate limiter for sensitive authentication operations (login, forgot-password, resend).
 */
const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many attempts for this action. Please try again in 15 minutes.",
    });
  },
});

/**
 * Rate limiter for public AI Property Chatbot endpoints.
 */
const chatbotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 chatbot questions per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      message:
        "Chatbot rate limit exceeded. Please wait a few minutes before asking more questions.",
    });
  },
});

module.exports = {
  authLimiter,
  sensitiveAuthLimiter,
  chatbotLimiter,
};
