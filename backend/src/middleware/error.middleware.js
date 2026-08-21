const ApiError = require("../utils/ApiError");
const config = require("../config");

// Map AI package error codes to HTTP status codes per INTEGRATION.md §6
const AI_ERROR_HTTP_MAP = {
  CONFIG_MISSING: 500,
  PROVIDER_AUTH: 502,
  PROVIDER_TIMEOUT: 502,
  PROVIDER_UNAVAILABLE: 502,
  INVALID_OUTPUT: 502,
};

const AI_ERROR_CLIENT_MESSAGES = {
  CONFIG_MISSING: "AI service is not configured",
  PROVIDER_AUTH: "AI service unavailable, try again",
  PROVIDER_TIMEOUT: "AI service unavailable, try again",
  PROVIDER_UNAVAILABLE: "AI service unavailable, try again",
  INVALID_OUTPUT: "Could not generate content",
};

/**
 * Centralized Express Error Handling Middleware.
 * Catches all operational and unhandled errors and formats standard JSON envelope.
 */
const errorHandler = (err, req, res, next) => {
  // Handle @property-rental/ai AiError (code-based)
  if (err && err.name === "AiError" && err.code) {
    const statusCode = AI_ERROR_HTTP_MAP[err.code] || 500;
    const message =
      AI_ERROR_CLIENT_MESSAGES[err.code] || "AI service error";
    console.error(`[AI ERROR] code=${err.code}, status=${statusCode}`);
    return res.status(statusCode).json({ statusCode, success: false, message });
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Multer File Upload errors
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "MISSING_FIELD_NAME") {
      message =
        "Form-data field name is missing. Please set the field key name to 'images'.";
    } else if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the 5 MB limit.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files. Maximum 10 images allowed per upload.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected field '${err.field}'. Use field name 'images'.`;
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Log unexpected internal errors
  if (statusCode === 500) {
    console.error("[SERVER ERROR]", err);
    if (config.nodeEnv === "production") {
      message = "An unexpected error occurred. Please try again later.";
    }
  }

  const response = {
    statusCode,
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (config.nodeEnv !== "production" && statusCode === 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
