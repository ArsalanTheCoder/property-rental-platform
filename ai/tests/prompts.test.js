/**
 * Prompts tests
 */
const {
  buildTitlePrompt,
  TITLE_SYSTEM_PROMPT,
} = require('../src/prompts/title');
const {
  buildDescriptionPrompt,
  DESCRIPTION_SYSTEM_PROMPT,
} = require('../src/prompts/description');
const {
  buildChatbotSystemPrompt,
  buildChatbotMessages,
} = require('../src/prompts/chatbot');
const {
  buildLeadScoringPrompt,
  LEAD_SCORING_SYSTEM_PROMPT,
} = require('../src/prompts/lead-scoring');

describe('Prompts', () => {
  const validProperty = {
    propertyType: 'Apartment',
    price: 2000,
    location: 'Downtown',
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Parking', 'Gym'],
    furnished: true,
  };

  describe('Title Prompts', () => {
    it('should have a system prompt', () => {
      expect(TITLE_SYSTEM_PROMPT).toBeDefined();
      expect(typeof TITLE_SYSTEM_PROMPT).toBe('string');
      expect(TITLE_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should build title prompt from property', () => {
      const messages = buildTitlePrompt(validProperty);
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('should include property details in prompt', () => {
      const messages = buildTitlePrompt(validProperty);
      const userContent = messages[1].content;
      expect(userContent).toContain('Apartment');
      expect(userContent).toContain('2');
      expect(userContent).toContain('Downtown');
    });
  });

  describe('Description Prompts', () => {
    it('should have a system prompt', () => {
      expect(DESCRIPTION_SYSTEM_PROMPT).toBeDefined();
      expect(typeof DESCRIPTION_SYSTEM_PROMPT).toBe('string');
      expect(DESCRIPTION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should build description prompt from property', () => {
      const messages = buildDescriptionPrompt(validProperty);
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('should include property details in prompt', () => {
      const messages = buildDescriptionPrompt(validProperty);
      const userContent = messages[1].content;
      expect(userContent).toContain('Apartment');
      expect(userContent).toContain('2000');
      expect(userContent).toContain('Downtown');
      expect(userContent).toContain('Parking');
    });

    it('should handle empty amenities', () => {
      const propertyNoAmenities = { ...validProperty, amenities: [] };
      const messages = buildDescriptionPrompt(propertyNoAmenities);
      const userContent = messages[1].content;
      expect(userContent).toContain('Essential amenities');
    });
  });

  describe('Chatbot Prompts', () => {
    it('should build system prompt with property context', () => {
      const prompt = buildChatbotSystemPrompt(validProperty);
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('Apartment');
      expect(prompt).toContain('2000');
      expect(prompt).toContain('Downtown');
      expect(prompt).toContain('Parking');
    });

    it('should build chatbot messages', () => {
      const messages = buildChatbotMessages(
        validProperty,
        'What is the price?'
      );
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('What is the price?');
    });

    it('should include conversation history', () => {
      const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      const messages = buildChatbotMessages(
        validProperty,
        'Tell me more',
        history
      );
      expect(messages.length).toBe(4);
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('Hello');
      expect(messages[2].role).toBe('assistant');
      expect(messages[2].content).toBe('Hi there!');
    });
  });

  describe('Lead Scoring Prompts', () => {
    it('should have a system prompt', () => {
      expect(LEAD_SCORING_SYSTEM_PROMPT).toBeDefined();
      expect(typeof LEAD_SCORING_SYSTEM_PROMPT).toBe('string');
      expect(LEAD_SCORING_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should build lead scoring prompt', () => {
      const input = { propertyId: 'prop-123', userId: 'user-456' };
      const messages = buildLeadScoringPrompt(input);
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('should include input details in prompt', () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        viewingDate: '2024-01-15',
        message: 'Interested in property',
      };
      const messages = buildLeadScoringPrompt(input);
      const userContent = messages[1].content;
      expect(userContent).toContain('prop-123');
      expect(userContent).toContain('user-456');
      expect(userContent).toContain('2024-01-15');
      expect(userContent).toContain('Interested in property');
    });

    it('should handle optional fields', () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        viewingTime: '10:00 AM',
        userProfile: { name: 'John', email: 'john@example.com' },
      };
      const messages = buildLeadScoringPrompt(input);
      const userContent = messages[1].content;
      expect(userContent).toContain('10:00 AM');
      expect(userContent).toContain('John');
      expect(userContent).toContain('john@example.com');
    });
  });
});
