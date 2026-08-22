/**
 * @property-rental/ai
 *
 * AI package for Property Rental Platform
 * Provides property title/description generation, chatbot, and lead scoring
 */
const {
  loadConfig,
  createProvider,
} = require('./config');
const {
  validatePropertyInput,
  validateChatRequest,
  validateLeadScoreInput,
} = require('./validation');
const TitleGenerator = require('./generators/title-generator');
const DescriptionGenerator = require('./generators/description-generator');
const PropertyChatbot = require('./chatbot');
const LeadScorer = require('./lead-scoring');
const MockProvider = require('./providers/mock-provider');
const LiveProvider = require('./providers/live-provider');

// Error classes
const {
  AIError,
  ValidationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  ModelError,
  ConfigurationError,
} = require('./errors');

// Default provider instance (lazy initialized)
let defaultProvider = null;
let defaultConfig = null;

/**
 * Get or create the default provider
 * @param {Object} config - Optional configuration override
 * @returns {Object} Provider instance
 */
function getProvider(config = null) {
  if (config) {
    return createProvider(config);
  }
  if (!defaultProvider) {
    defaultConfig = loadConfig();
    defaultProvider = createProvider(defaultConfig);
  }
  return defaultProvider;
}

/**
 * Reset the default provider (useful for testing)
 */
function resetProvider() {
  defaultProvider = null;
  defaultConfig = null;
}

// ============================================
// Public API Functions
// ============================================

/**
 * Generate a property title
 * @param {Object} property - Property input
 * @param {Object} options - Optional { config, provider }
 * @returns {Promise<Object>} Generated title
 */
async function generatePropertyTitle(property, options = {}) {
  const provider = options.provider || getProvider(options.config);
  const generator = new TitleGenerator(provider);
  return generator.generate(property);
}

/**
 * Generate a property description
 * @param {Object} property - Property input
 * @param {Object} options - Optional { config, provider }
 * @returns {Promise<Object>} Generated description
 */
async function generatePropertyDescription(property, options = {}) {
  const provider = options.provider || getProvider(options.config);
  const generator = new DescriptionGenerator(provider);
  return generator.generate(property);
}

/**
 * Generate both title and description for a property
 * @param {Object} property - Property input
 * @param {Object} options - Optional { config, provider }
 * @returns {Promise<Object>} Generated title and description
 */
async function generatePropertyContent(property, options = {}) {
  const provider = options.provider || getProvider(options.config);
  const [titleResult, descriptionResult] = await Promise.all([
    new TitleGenerator(provider).generate(property),
    new DescriptionGenerator(provider).generate(property),
  ]);
  return {
    title: titleResult.title,
    description: descriptionResult.description,
    model: titleResult.model,
    usage: {
      promptTokens: (titleResult.usage?.promptTokens || 0) + (descriptionResult.usage?.promptTokens || 0),
      completionTokens: (titleResult.usage?.completionTokens || 0) + (descriptionResult.usage?.completionTokens || 0),
      totalTokens: (titleResult.usage?.totalTokens || 0) + (descriptionResult.usage?.totalTokens || 0),
    },
  };
}

/**
 * Chat with a property-specific chatbot
 * @param {Object} request - Chat request
 * @param {Object} options - Optional { config, provider }
 * @returns {Promise<Object>} Chat response
 */
async function chatWithProperty(request, options = {}) {
  const provider = options.provider || getProvider(options.config);
  const chatbot = new PropertyChatbot(provider);
  return chatbot.chat(request);
}

/**
 * Score a lead based on inquiry information
 * @param {Object} input - Lead scoring input
 * @param {Object} options - Optional { config, provider }
 * @returns {Promise<Object>} Lead score
 */
async function scoreLead(input, options = {}) {
  const provider = options.provider || getProvider(options.config);
  const scorer = new LeadScorer(provider);
  return scorer.score(input);
}

/**
 * Create a provider with custom configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Provider instance
 */
function createAIProvider(config) {
  return createProvider(config);
}

// ============================================
// Exports
// ============================================

module.exports = {
  // Public API functions
  generatePropertyTitle,
  generatePropertyDescription,
  generatePropertyContent,
  chatWithProperty,
  scoreLead,

  // Provider factory
  createAIProvider,

  // Provider classes
  MockProvider,
  LiveProvider,

  // Generator classes
  TitleGenerator,
  DescriptionGenerator,

  // Service classes
  PropertyChatbot,
  LeadScorer,

  // Error classes
  AIError,
  ValidationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  ModelError,
  ConfigurationError,

  // Utility functions
  loadConfig,
  resetProvider,

  // Validation functions
  validatePropertyInput,
  validateChatRequest,
  validateLeadScoreInput,
};
