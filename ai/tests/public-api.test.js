/**
 * Public API tests
 */
const {
  generatePropertyTitle,
  generatePropertyDescription,
  generatePropertyContent,
  chatWithProperty,
  scoreLead,
  createAIProvider,
  MockProvider,
  LiveProvider,
  AIError,
  ValidationError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  ModelError,
  ConfigurationError,
  loadConfig,
  resetProvider,
} = require('../src/index');

describe('Public API', () => {
  const validProperty = {
    propertyType: 'Apartment',
    price: 2000,
    location: 'Downtown',
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Parking', 'Gym'],
    furnished: true,
  };

  beforeEach(() => {
    resetProvider();
  });

  describe('generatePropertyTitle', () => {
    it('should generate a title using mock provider', async () => {
      const result = await generatePropertyTitle(validProperty);
      expect(result).toHaveProperty('title');
      expect(typeof result.title).toBe('string');
      expect(result.title.length).toBeGreaterThan(0);
    });

    it('should accept custom provider', async () => {
      const mockProvider = new MockProvider();
      const result = await generatePropertyTitle(validProperty, { provider: mockProvider });
      expect(result).toHaveProperty('title');
      expect(result.model).toBe('mock');
    });

    it('should validate property input', async () => {
      await expect(generatePropertyTitle({})).rejects.toThrow(ValidationError);
    });
  });

  describe('generatePropertyDescription', () => {
    it('should generate a description using mock provider', async () => {
      const result = await generatePropertyDescription(validProperty);
      expect(result).toHaveProperty('description');
      expect(typeof result.description).toBe('string');
      expect(result.description.length).toBeGreaterThan(0);
    });

    it('should accept custom provider', async () => {
      const mockProvider = new MockProvider();
      const result = await generatePropertyDescription(validProperty, { provider: mockProvider });
      expect(result).toHaveProperty('description');
      expect(result.model).toBe('mock');
    });

    it('should validate property input', async () => {
      await expect(generatePropertyDescription({})).rejects.toThrow(ValidationError);
    });
  });

  describe('generatePropertyContent', () => {
    it('should generate both title and description', async () => {
      const result = await generatePropertyContent(validProperty);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');
    });

    it('should accept custom provider', async () => {
      const mockProvider = new MockProvider();
      const result = await generatePropertyContent(validProperty, { provider: mockProvider });
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result.model).toBe('mock');
    });

    it('should validate property input', async () => {
      await expect(generatePropertyContent({})).rejects.toThrow(ValidationError);
    });
  });

  describe('chatWithProperty', () => {
    it('should chat about a property', async () => {
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'What is the price?',
      };
      const result = await chatWithProperty(request);
      expect(result).toHaveProperty('answer');
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
    });

    it('should accept custom provider', async () => {
      const mockProvider = new MockProvider();
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'Tell me about this property',
      };
      const result = await chatWithProperty(request, { provider: mockProvider });
      expect(result).toHaveProperty('answer');
      expect(result.model).toBe('mock');
    });

    it('should validate request', async () => {
      await expect(chatWithProperty({})).rejects.toThrow(ValidationError);
    });
  });

  describe('scoreLead', () => {
    it('should score a lead', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const result = await scoreLead(input);
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should accept custom provider', async () => {
      const mockProvider = new MockProvider();
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const result = await scoreLead(input, { provider: mockProvider });
      expect(result).toHaveProperty('score');
      expect(result.model).toBe('mock');
    });

    it('should validate input', async () => {
      await expect(scoreLead({})).rejects.toThrow(ValidationError);
    });
  });

  describe('createAIProvider', () => {
    it('should create a mock provider', () => {
      const provider = createAIProvider({ provider: 'mock' });
      expect(provider).toBeInstanceOf(MockProvider);
    });

    it('should throw for invalid provider', () => {
      expect(() => createAIProvider({ provider: 'invalid' })).toThrow(ConfigurationError);
    });
  });

  describe('loadConfig', () => {
    it('should load default config', () => {
      const config = loadConfig({});
      expect(config.provider).toBe('mock');
    });

    it('should load from environment variables', () => {
      const config = loadConfig({
        AI_PROVIDER: 'mock',
        AI_API_KEY: 'test-key',
        AI_MODEL: 'gpt-3.5-turbo',
      });
      expect(config.provider).toBe('mock');
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-3.5-turbo');
    });

    it('should throw for invalid provider', () => {
      expect(() => loadConfig({ AI_PROVIDER: 'invalid' })).toThrow(ConfigurationError);
    });

    it('should throw for live provider without API key', () => {
      expect(() => loadConfig({ AI_PROVIDER: 'live' })).toThrow(ConfigurationError);
    });
  });

  describe('exports', () => {
    it('should export all error classes', () => {
      expect(AIError).toBeDefined();
      expect(ValidationError).toBeDefined();
      expect(ProviderError).toBeDefined();
      expect(RateLimitError).toBeDefined();
      expect(TimeoutError).toBeDefined();
      expect(ModelError).toBeDefined();
      expect(ConfigurationError).toBeDefined();
    });

    it('should export provider classes', () => {
      expect(MockProvider).toBeDefined();
      expect(LiveProvider).toBeDefined();
    });

    it('should export utility functions', () => {
      expect(typeof loadConfig).toBe('function');
      expect(typeof resetProvider).toBe('function');
    });
  });

  describe('stateless behavior', () => {
    it('should not persist data between calls', async () => {
      const result1 = await generatePropertyTitle(validProperty);
      const result2 = await generatePropertyTitle(validProperty);
      // Results should be identical (deterministic)
      expect(result1.title).toBe(result2.title);
    });
  });
});
