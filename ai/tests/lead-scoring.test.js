/**
 * Lead scoring tests
 */
const MockProvider = require('../src/providers/mock-provider');
const LeadScorer = require('../src/lead-scoring');
const { ValidationError } = require('../src/errors');

describe('LeadScorer', () => {
  let provider;
  let scorer;

  beforeEach(() => {
    provider = new MockProvider({ mockDelayMs: 0 });
    scorer = new LeadScorer(provider);
  });

  describe('score', () => {
    it('should score a lead with minimal information', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };

      const result = await scorer.score(input);
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('usage');
    });

    it('should validate the input', async () => {
      await expect(scorer.score({})).rejects.toThrow(ValidationError);
      await expect(scorer.score({ propertyId: '', userId: 'user-123' })).rejects.toThrow(ValidationError);
      await expect(scorer.score({ propertyId: 'prop-123', userId: '' })).rejects.toThrow(ValidationError);
    });

    it('should accept optional viewing information', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        viewingDate: '2024-01-15',
        viewingTime: '10:00 AM',
      };

      const result = await scorer.score(input);
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should accept optional message', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        message: 'I am very interested in this property and would like to schedule a viewing soon.',
      };

      const result = await scorer.score(input);
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should reject message exceeding 1000 characters', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        message: 'a'.repeat(1001),
      };
      await expect(scorer.score(input)).rejects.toThrow(ValidationError);
    });

    it('should accept optional user profile', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
        userProfile: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const result = await scorer.score(input);
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return higher score with more information', async () => {
      const minimalInput = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };

      const completeInput = {
        ...minimalInput,
        viewingDate: '2024-01-15',
        viewingTime: '10:00 AM',
        message: 'I am very interested in this property and would like to schedule a viewing.',
        userProfile: { name: 'John', email: 'john@example.com' },
      };

      const minimalResult = await scorer.score(minimalInput);
      const completeResult = await scorer.score(completeInput);
      expect(completeResult.score).toBeGreaterThanOrEqual(minimalResult.score);
    });
  });

  describe('stateless behavior', () => {
    it('should not persist any data between calls', async () => {
      const input = {
        propertyId: 'prop-123',
        userId: 'user-456',
      };

      const result1 = await scorer.score(input);
      const result2 = await scorer.score(input);

      // Results should be identical (deterministic)
      expect(result1.score).toBe(result2.score);
    });
  });
});
