/**
 * Custom error classes for AI package
 * All errors have stable error codes for client handling
 */

class AIError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AIError {
  constructor(message, field = null) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.field = field;
  }
}

class ProviderError extends AIError {
  constructor(message, originalError = null) {
    super(message, "PROVIDER_ERROR", 502);
    this.name = "ProviderError";
    this.originalError = originalError;
  }
}

class RateLimitError extends AIError {
  constructor(message = "Rate limit exceeded", retryAfter = null) {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

class TimeoutError extends AIError {
  constructor(message = "Request timed out", timeoutMs = null) {
    super(message, "TIMEOUT_ERROR", 408);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

class ModelError extends AIError {
  constructor(message = "Invalid model response", response = null) {
    super(message, "MODEL_ERROR", 500);
    this.name = "ModelError";
    this.response = response;
  }
}

class ConfigurationError extends AIError {
  constructor(message) {
    super(message, "CONFIGURATION_ERROR", 500);
    this.name = "ConfigurationError";
  }
}

module.exports = {
  AIError,
  ValidationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  ModelError,
  ConfigurationError,
};
