/**
 * Property chatbot tests
 */
const MockProvider = require('../src/providers/mock-provider');
const PropertyChatbot = require('../src/chatbot');
const { ValidationError } = require('../src/errors');

describe('PropertyChatbot', () => {
  let provider;
  let chatbot;

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
    chatbot = new PropertyChatbot(provider);
  });

  describe('chat', () => {
    it('should respond to a question about the property', async () => {
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'What is the price?',
      };

      const result = await chatbot.chat(request);
      expect(result).toHaveProperty('answer');
      expect(typeof result.answer).toBe('string');
      expect(result.answer.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('usage');
    });

    it('should validate the request', async () => {
      await expect(chatbot.chat({})).rejects.toThrow(ValidationError);
      await expect(chatbot.chat({ propertyId: '', property: validProperty, question: 'test' })).rejects.toThrow(ValidationError);
    });

    it('should validate property in request', async () => {
      const request = {
        propertyId: 'prop-123',
        property: {},
        question: 'What is the price?',
      };
      await expect(chatbot.chat(request)).rejects.toThrow(ValidationError);
    });

    it('should handle conversation history', async () => {
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'Tell me more',
        conversationHistory: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi! How can I help you with this property?' },
        ],
      };

      const result = await chatbot.chat(request);
      expect(result).toHaveProperty('answer');
      expect(result.answer.length).toBeGreaterThan(0);
    });

    it('should reject conversation history with more than 10 messages', async () => {
      const history = Array(11).fill({ role: 'user', content: 'test' });
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'test',
        conversationHistory: history,
      };
      await expect(chatbot.chat(request)).rejects.toThrow(ValidationError);
    });

    it('should provide property-specific responses', async () => {
      const request = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'How many bedrooms does this property have?',
      };

      const result = await chatbot.chat(request);
      expect(result.answer).toBeDefined();
      // The mock provider provides relevant responses
      expect(result.answer.toLowerCase()).toContain('bedroom');
    });

    it('should work with different property types', async () => {
      const houseProperty = {
        ...validProperty,
        propertyType: 'House',
        bedrooms: 4,
      };

      const request = {
        propertyId: 'prop-456',
        property: houseProperty,
        question: 'What type of property is this?',
      };

      const result = await chatbot.chat(request);
      expect(result).toHaveProperty('answer');
    });
  });

  describe('stateless behavior', () => {
    it('should not persist conversation between calls', async () => {
      const request1 = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'What is the price?',
      };
      const request2 = {
        propertyId: 'prop-123',
        property: validProperty,
        question: 'How many bedrooms?',
      };

      const result1 = await chatbot.chat(request1);
      const result2 = await chatbot.chat(request2);

      // Each call should be independent
      expect(result1.answer).toBeDefined();
      expect(result2.answer).toBeDefined();
    });
  });
});
