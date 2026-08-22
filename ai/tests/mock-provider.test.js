/**
 * MockProvider tests
 */
const MockProvider = require('../src/providers/mock-provider');

describe('MockProvider', () => {
  let provider;

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
    provider = new MockProvider({ mockDelayMs: 0 });
  });

  describe('generateTitle', () => {
    it('should generate a title from property input', async () => {
      const result = await provider.generateTitle(validProperty);
      expect(result).toHaveProperty('title');
      expect(typeof result.title).toBe('string');
      expect(result.title.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('model', 'mock');
      expect(result).toHaveProperty('usage');
    });

    it('should include property type in title', async () => {
      const result = await provider.generateTitle(validProperty);
      expect(result.title).toContain('Apartment');
    });

    it('should include location in title', async () => {
      const result = await provider.generateTitle(validProperty);
      expect(result.title).toContain('Downtown');
    });

    it('should indicate furnished status', async () => {
      const result = await provider.generateTitle(validProperty);
      expect(result.title).toContain('Furnished');
    });

    it('should handle unfurnished property', async () => {
      const result = await provider.generateTitle({ ...validProperty, furnished: false });
      expect(result.title).toContain('Unfurnished');
    });

    it('should handle studio (0 bedrooms)', async () => {
      const result = await provider.generateTitle({ ...validProperty, bedrooms: 0 });
      expect(result.title).toContain('Studio');
    });
  });

  describe('generateDescription', () => {
    it('should generate a description from property input', async () => {
      const result = await provider.generateDescription(validProperty);
      expect(result).toHaveProperty('description');
      expect(typeof result.description).toBe('string');
      expect(result.description.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('model', 'mock');
      expect(result).toHaveProperty('usage');
    });

    it('should include property type in description', async () => {
      const result = await provider.generateDescription(validProperty);
      expect(result.description).toContain('Apartment');
    });

    it('should include location in description', async () => {
      const result = await provider.generateDescription(validProperty);
      expect(result.description).toContain('Downtown');
    });

    it('should include amenities in description', async () => {
      const result = await provider.generateDescription(validProperty);
      expect(result.description).toContain('Parking');
      expect(result.description).toContain('Gym');
    });

    it('should handle empty amenities', async () => {
      const result = await provider.generateDescription({ ...validProperty, amenities: [] });
      expect(result.description).toContain('basic amenities');
    });
  });

  describe('chat', () => {
    it('should respond to a question', async () => {
      const messages = [
        { role: 'user', content: 'What is the price?' },
      ];
      const result = await provider.chat(messages);
      expect(result).toHaveProperty('answer');
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('model', 'mock');
      expect(result).toHaveProperty('usage');
    });

    it('should provide relevant response for price questions', async () => {
      const messages = [
        { role: 'user', content: 'How much does it cost?' },
      ];
      const result = await provider.chat(messages);
      expect(result.answer.toLowerCase()).toContain('price');
    });

    it('should provide relevant response for bedroom questions', async () => {
      const messages = [
        { role: 'user', content: 'How many bedrooms are there?' },
      ];
      const result = await provider.chat(messages);
      expect(result.answer.toLowerCase()).toContain('bedroom');
    });

    it('should provide relevant response for amenities questions', async () => {
      const messages = [
        { role: 'user', content: 'What amenities are included?' },
      ];
      const result = await provider.chat(messages);
      expect(result.answer.toLowerCase()).toContain('amenities');
    });

    it('should provide generic response for unknown questions', async () => {
      const messages = [
        { role: 'user', content: 'Random question xyz' },
      ];
      const result = await provider.chat(messages);
      expect(result.answer.length).toBeGreaterThan(0);
    });
  });

  describe('scoreLead', () => {
    it('should score a lead', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const result = await provider.scoreLead(input);
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result).toHaveProperty('model', 'mock');
      expect(result).toHaveProperty('usage');
    });

    it('should increase score with viewing date', async () => {
      const baseInput = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const inputWithOptions = {
        ...baseInput,
        viewingDate: '2024-01-15',
        viewingTime: '10:00 AM',
      };
      const baseResult = await provider.scoreLead(baseInput);
      const optionResult = await provider.scoreLead(inputWithOptions);
      expect(optionResult.score).toBeGreaterThanOrEqual(baseResult.score);
    });

    it('should increase score with message', async () => {
      const baseInput = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const inputWithMessage = {
        ...baseInput,
        message: 'I am very interested in this property and would like to schedule a viewing.',
      };
      const baseResult = await provider.scoreLead(baseInput);
      const messageResult = await provider.scoreLead(inputWithMessage);
      expect(messageResult.score).toBeGreaterThanOrEqual(baseResult.score);
    });

    it('should increase score with user profile', async () => {
      const baseInput = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };
      const inputWithProfile = {
        ...baseInput,
        userProfile: { name: 'John', email: 'john@example.com' },
      };
      const baseResult = await provider.scoreLead(baseInput);
      const profileResult = await provider.scoreLead(inputWithProfile);
      expect(profileResult.score).toBeGreaterThanOrEqual(baseResult.score);
    });
  });

  describe('delay', () => {
    it('should not delay when delayMs is 0', async () => {
      const start = Date.now();
      await provider.delay();
      const end = Date.now();
      expect(end - start).toBeLessThan(50);
    });

    it('should delay when delayMs is set', async () => {
      const delayedProvider = new MockProvider({ mockDelayMs: 100 });
      const start = Date.now();
      await delayedProvider.delay();
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('stateless behavior', () => {
    it('should not persist any data between calls', async () => {
      const result1 = await provider.generateTitle(validProperty);
      const result2 = await provider.generateTitle(validProperty);
      // Results should be identical (deterministic)
      expect(result1.title).toBe(result2.title);
    });
  });
});
