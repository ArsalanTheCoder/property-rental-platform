/** * Configuration tests */ const {
  loadConfig,
  createProvider,
  DEFAULT_CONFIG,
} = require("../src/config");
const MockProvider = require("../src/providers/mock-provider");
const { ConfigurationError } = require("../src/errors");
describe("Configuration", () => {
  describe("loadConfig", () => {
    it("should return default config when no env vars provided", () => {
      const config = loadConfig({});
      expect(config).toHaveProperty("provider", "mock");
      expect(config).toHaveProperty("baseUrl", "https://api.openai.com/v1");
      expect(config).toHaveProperty("model", "gpt-4");
      expect(config).toHaveProperty("temperature", 0.7);
      expect(config).toHaveProperty("maxTokens", 1000);
    });
    it("should load provider from env", () => {
      const config = loadConfig({ AI_PROVIDER: "mock" });
      expect(config.provider).toBe("mock");
    });
    it("should load API key from env", () => {
      const config = loadConfig({ AI_API_KEY: "test-key" });
      expect(config.apiKey).toBe("test-key");
    });
    it("should load base URL from env", () => {
      const config = loadConfig({ AI_BASE_URL: "http://localhost:8080/v1" });
      expect(config.baseUrl).toBe("http://localhost:8080/v1");
    });
    it("should load model from env", () => {
      const config = loadConfig({ AI_MODEL: "gpt-3.5-turbo" });
      expect(config.model).toBe("gpt-3.5-turbo");
    });
    it("should load numeric values from env", () => {
      const config = loadConfig({
        AI_TEMPERATURE: "0.5",
        AI_MAX_TOKENS: "500",
        AI_TIMEOUT_MS: "10000",
      });
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(500);
      expect(config.timeoutMs).toBe(10000);
    });
    it("should throw for invalid provider", () => {
      expect(() => loadConfig({ AI_PROVIDER: "invalid" })).toThrow(
        ConfigurationError,
      );
    });
    it("should throw for live provider without API key", () => {
      expect(() => loadConfig({ AI_PROVIDER: "live" })).toThrow(
        ConfigurationError,
      );
    });
    it("should not throw for mock provider without API key", () => {
      expect(() => loadConfig({ AI_PROVIDER: "mock" })).not.toThrow();
    });
  });
  describe("createProvider", () => {
    it("should create mock provider", () => {
      const provider = createProvider({ provider: "mock" });
      expect(provider).toBeInstanceOf(MockProvider);
    });
    it("should throw for unknown provider", () => {
      expect(() => createProvider({ provider: "unknown" })).toThrow(
        ConfigurationError,
      );
    });
  });
  describe("DEFAULT_CONFIG", () => {
    it("should have all required fields", () => {
      expect(DEFAULT_CONFIG).toHaveProperty("provider");
      expect(DEFAULT_CONFIG).toHaveProperty("baseUrl");
      expect(DEFAULT_CONFIG).toHaveProperty("model");
      expect(DEFAULT_CONFIG).toHaveProperty("temperature");
      expect(DEFAULT_CONFIG).toHaveProperty("maxTokens");
      expect(DEFAULT_CONFIG).toHaveProperty("timeoutMs");
      expect(DEFAULT_CONFIG).toHaveProperty("retryAttempts");
      expect(DEFAULT_CONFIG).toHaveProperty("retryDelayMs");
      expect(DEFAULT_CONFIG).toHaveProperty("mockDelayMs");
    });
  });
});
