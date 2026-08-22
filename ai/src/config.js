/**
 * Configuration module for AI package
 * Loads settings from environment variables with defaults
 */

const { ConfigurationError } = require('./errors');

const DEFAULT_CONFIG = {
  provider: 'mock',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  timeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
  mockDelayMs: 0
};

/**
 * Load configuration from environment variables
 * @param {Object} env - Environment variables (defaults to process.env)
 * @returns {Object} Configuration object
 */
function loadConfig(env = process.env) {
  const config = {
    provider: env.AI_PROVIDER || DEFAULT_CONFIG.provider,
    apiKey: env.AI_API_KEY || DEFAULT_CONFIG.apiKey,
    baseUrl: env.AI_BASE_URL || DEFAULT_CONFIG.baseUrl,
    model: env.AI_MODEL || DEFAULT_CONFIG.model,
    temperature: parseFloat(env.AI_TEMPERATURE) || DEFAULT_CONFIG.temperature,
    maxTokens: parseInt(env.AI_MAX_TOKENS, 10) || DEFAULT_CONFIG.maxTokens,
    timeoutMs: parseInt(env.AI_TIMEOUT_MS, 10) || DEFAULT_CONFIG.timeoutMs,
    retryAttempts: parseInt(env.AI_RETRY_ATTEMPTS, 10) || DEFAULT_CONFIG.retryAttempts,
    retryDelayMs: parseInt(env.AI_RETRY_DELAY_MS, 10) || DEFAULT_CONFIG.retryDelayMs,
    mockDelayMs: parseInt(env.AI_MOCK_DELAY_MS, 10) || DEFAULT_CONFIG.mockDelayMs
  };

  // Validate provider value
  if (!['mock', 'live'].includes(config.provider)) {
    throw new ConfigurationError(`Invalid AI_PROVIDER: ${config.provider}. Must be "mock" or "live"`);
  }

  // Live provider requires API key
  if (config.provider === 'live' && !config.apiKey) {
    throw new ConfigurationError('AI_API_KEY is required when AI_PROVIDER=live');
  }

  return config;
}

/**
 * Create a provider based on configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Provider instance
 */
function createProvider(config) {
  if (config.provider === 'mock') {
    const MockProvider = require('./providers/mock-provider');
    return new MockProvider(config);
  } else if (config.provider === 'live') {
    const LiveProvider = require('./providers/live-provider');
    return new LiveProvider(config);
  } else {
    throw new ConfigurationError(`Unknown provider: ${config.provider}`);
  }
}

module.exports = {
  DEFAULT_CONFIG,
  loadConfig,
  createProvider
};
