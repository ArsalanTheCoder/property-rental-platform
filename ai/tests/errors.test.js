/** * Error classes tests */ const {
  AIError,
  ValidationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  ModelError,
  ConfigurationError,
} = require("../src/errors");
describe("Error Classes", () => {
  describe("AIError", () => {
    it("should create an error with code and status", () => {
      const error = new AIError("Test error", "TEST_ERROR", 500);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AIError);
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("AIError");
    });
    it("should default to 500 status", () => {
      const error = new AIError("Test error", "TEST_ERROR");
      expect(error.statusCode).toBe(500);
    });
  });
  describe("ValidationError", () => {
    it("should create a validation error", () => {
      const error = new ValidationError("Invalid input", "fieldName");
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe("fieldName");
    });
    it("should default field to null", () => {
      const error = new ValidationError("Invalid input");
      expect(error.field).toBeNull();
    });
  });
  describe("ProviderError", () => {
    it("should create a provider error", () => {
      const originalError = new Error("Original");
      const error = new ProviderError("Provider failed", originalError);
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error.message).toBe("Provider failed");
      expect(error.code).toBe("PROVIDER_ERROR");
      expect(error.statusCode).toBe(502);
      expect(error.originalError).toBe(originalError);
    });
    it("should default originalError to null", () => {
      const error = new ProviderError("Provider failed");
      expect(error.originalError).toBeNull();
    });
  });
  describe("RateLimitError", () => {
    it("should create a rate limit error", () => {
      const error = new RateLimitError("Rate limited", 60);
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe("Rate limited");
      expect(error.code).toBe("RATE_LIMIT_ERROR");
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });
    it("should use default message", () => {
      const error = new RateLimitError();
      expect(error.message).toBe("Rate limit exceeded");
    });
    it("should default retryAfter to null", () => {
      const error = new RateLimitError();
      expect(error.retryAfter).toBeNull();
    });
  });
  describe("TimeoutError", () => {
    it("should create a timeout error", () => {
      const error = new TimeoutError("Timed out", 30000);
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe("Timed out");
      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.statusCode).toBe(408);
      expect(error.timeoutMs).toBe(30000);
    });
    it("should use default message", () => {
      const error = new TimeoutError();
      expect(error.message).toBe("Request timed out");
    });
    it("should default timeoutMs to null", () => {
      const error = new TimeoutError();
      expect(error.timeoutMs).toBeNull();
    });
  });
  describe("ModelError", () => {
    it("should create a model error", () => {
      const response = { choices: [] };
      const error = new ModelError("Invalid response", response);
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(ModelError);
      expect(error.message).toBe("Invalid response");
      expect(error.code).toBe("MODEL_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.response).toBe(response);
    });
    it("should use default message", () => {
      const error = new ModelError();
      expect(error.message).toBe("Invalid model response");
    });
    it("should default response to null", () => {
      const error = new ModelError();
      expect(error.response).toBeNull();
    });
  });
  describe("ConfigurationError", () => {
    it("should create a configuration error", () => {
      const error = new ConfigurationError("Missing config");
      expect(error).toBeInstanceOf(AIError);
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.message).toBe("Missing config");
      expect(error.code).toBe("CONFIGURATION_ERROR");
      expect(error.statusCode).toBe(500);
    });
  });
  describe("Error codes", () => {
    it("should have stable error codes", () => {
      expect(new ValidationError("test").code).toBe("VALIDATION_ERROR");
      expect(new ProviderError("test").code).toBe("PROVIDER_ERROR");
      expect(new RateLimitError().code).toBe("RATE_LIMIT_ERROR");
      expect(new TimeoutError().code).toBe("TIMEOUT_ERROR");
      expect(new ModelError().code).toBe("MODEL_ERROR");
      expect(new ConfigurationError("test").code).toBe("CONFIGURATION_ERROR");
    });
  });
});
