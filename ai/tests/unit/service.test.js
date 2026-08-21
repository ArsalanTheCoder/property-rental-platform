'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createService } = require('../../src/service');
const { createMockProvider } = require('../../src/providers/mock');
const { AiError, isAiError } = require('../../src/errors');

test('createService requires a provider', () => {
  assert.throws(() => createService(null, {}), TypeError);
  assert.throws(() => createService(undefined, {}), TypeError);
});

test('createService exposes generateContent', () => {
  const service = createService(createMockProvider(), {});
  assert.equal(typeof service.generateContent, 'function');
});

test('generateContent validates and normalizes mock output', async () => {
  const service = createService(createMockProvider(), {});
  const content = await service.generateContent({ location: 'DHA Karachi', bedrooms: 2 });
  assert.equal(content.title, '2-Bedroom in DHA Karachi');
  assert.ok(content.description.includes('2 bedrooms'), `unexpected description: ${content.description}`);
  assert.ok(Object.isFrozen(content), 'returned content should be immutable');
});

test('generateContent retries once on INVALID_OUTPUT and returns the retried result', async () => {
  let calls = 0;
  const flakyProvider = {
    async generateContent() {
      calls += 1;
      if (calls === 1) {
        throw new AiError('INVALID_OUTPUT', 'first attempt was malformed');
      }
      return { title: '  Good   Title ', description: ' Good desc ' };
    },
  };
  const service = createService(flakyProvider, {});
  const content = await service.generateContent({});
  assert.equal(calls, 2);
  assert.deepEqual(content, { title: 'Good Title', description: 'Good desc' });
});

test('generateContent throws after repeated INVALID_OUTPUT', async () => {
  const alwaysBadProvider = {
    async generateContent() {
      throw new AiError('INVALID_OUTPUT', 'always malformed');
    },
  };
  const service = createService(alwaysBadProvider, {});
  await assert.rejects(
    () => service.generateContent({}),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('generateContent does not retry non-INVALID_OUTPUT errors', async () => {
  let calls = 0;
  const erroringProvider = {
    async generateContent() {
      calls += 1;
      throw new AiError('PROVIDER_UNAVAILABLE', 'down', { retryable: true });
    },
  };
  const service = createService(erroringProvider, {});
  await assert.rejects(
    () => service.generateContent({}),
    (e) => isAiError(e) && e.code === 'PROVIDER_UNAVAILABLE'
  );
  assert.equal(calls, 1, 'provider errors must not be retried by the service');
});

test('generateContent applies configured length limits', async () => {
  const service = createService(createMockProvider(), { maxTitleLength: 5, maxDescriptionLength: 1000 });
  await assert.rejects(
    () => service.generateContent({ location: 'DHA Karachi', bedrooms: 2 }),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('generateContent falls back to defaults when config omits limits', async () => {
  const service = createService(createMockProvider(), {});
  const content = await service.generateContent({ location: 'DHA Karachi', bedrooms: 2 });
  assert.ok(content.title.length <= 120);
  assert.ok(content.description.length <= 1000);
});

test('generateContent passes through a non-object raw input defensively', async () => {
  const service = createService(createMockProvider(), {});
  const content = await service.generateContent(undefined);
  assert.ok(content.title.length > 0);
  assert.ok(content.description.length > 0);
});

const FULL_PROPERTY = {
  propertyId: 'prop_123',
  title: 'Modern 2-Bed Apartment in DHA Karachi',
  description: 'A bright, furnished 2-bedroom apartment.',
  propertyType: 'apartment',
  price: 50000,
  location: 'DHA Karachi',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'wifi'],
  furnished: true,
  availability: true,
  status: 'published',
};

test('createService exposes answerQuestion', () => {
  const service = createService(createMockProvider(), {});
  assert.equal(typeof service.answerQuestion, 'function');
});

test('answerQuestion validates and normalizes the provider answer', async () => {
  const service = createService(createMockProvider(), {});
  const { answer } = await service.answerQuestion(FULL_PROPERTY, 'How much is the rent?');
  assert.equal(typeof answer, 'string');
  assert.ok(answer.includes('50,000'), `expected price in answer, got: ${answer}`);
  assert.equal(answer, answer.trim(), 'answer should be trimmed');
});

test('answerQuestion rejects a missing or non-object property context', async () => {
  const service = createService(createMockProvider(), {});
  await assert.rejects(() => service.answerQuestion(undefined, 'price?'), TypeError);
  await assert.rejects(() => service.answerQuestion(null, 'price?'), TypeError);
  await assert.rejects(() => service.answerQuestion('prop_123', 'price?'), TypeError);
});

test('answerQuestion rejects a missing or blank question', async () => {
  const service = createService(createMockProvider(), {});
  await assert.rejects(() => service.answerQuestion(FULL_PROPERTY, ''), TypeError);
  await assert.rejects(() => service.answerQuestion(FULL_PROPERTY, '   '), TypeError);
  await assert.rejects(() => service.answerQuestion(FULL_PROPERTY), TypeError);
});

test('answerQuestion rejects a question longer than the configured cap', async () => {
  const service = createService(createMockProvider(), { maxQuestionLength: 10 });
  await assert.rejects(() => service.answerQuestion(FULL_PROPERTY, 'a'.repeat(11)), TypeError);
});

test('answerQuestion maps a malformed provider answer to INVALID_OUTPUT', async () => {
  const badProvider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 42 };
    },
  };
  const service = createService(badProvider, {});
  await assert.rejects(
    () => service.answerQuestion(FULL_PROPERTY, 'price?'),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('answerQuestion maps an over-long provider answer to INVALID_OUTPUT', async () => {
  const verboseProvider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'x'.repeat(2001) };
    },
  };
  const service = createService(verboseProvider, { maxAnswerLength: 2000 });
  await assert.rejects(
    () => service.answerQuestion(FULL_PROPERTY, 'price?'),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('answerQuestion returns an immutable answer object', async () => {
  const service = createService(createMockProvider(), {});
  const result = await service.answerQuestion(FULL_PROPERTY, 'price?');
  assert.ok(Object.isFrozen(result), 'returned answer object should be immutable');
});

test('createService exposes scoreLead', () => {
  const service = createService(createMockProvider(), {});
  assert.equal(typeof service.scoreLead, 'function');
});

test('scoreLead validates and normalizes the mock score', async () => {
  const service = createService(createMockProvider(), {});
  const { score } = await service.scoreLead({
    message: 'Very interested, please call me soon.',
    date: '2026-08-20',
    time: '17:00',
    favoritesCount: 4,
    priorViewingCount: 2,
  });
  assert.ok(Number.isInteger(score), 'score must be an integer');
  assert.ok(score >= 0 && score <= 100, `score must be within 0-100, got ${score}`);
});

test('scoreLead rejects a missing or non-object context', async () => {
  const service = createService(createMockProvider(), {});
  await assert.rejects(() => service.scoreLead(undefined), TypeError);
  await assert.rejects(() => service.scoreLead(null), TypeError);
  await assert.rejects(() => service.scoreLead(42), TypeError);
});

test('scoreLead clamps out-of-range provider scores to 0-100', async () => {
  const provider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'a' };
    },
    async scoreLead() {
      return { score: 150 };
    },
  };
  const service = createService(provider, {});
  const { score } = await service.scoreLead({});
  assert.equal(score, 100);
});

test('scoreLead retries once on INVALID_OUTPUT then returns the retried result', async () => {
  let calls = 0;
  const flakyProvider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'a' };
    },
    async scoreLead() {
      calls += 1;
      if (calls === 1) {
        throw new AiError('INVALID_OUTPUT', 'first attempt was malformed');
      }
      return { score: 80 };
    },
  };
  const service = createService(flakyProvider, {});
  const { score } = await service.scoreLead({});
  assert.equal(calls, 2);
  assert.equal(score, 80);
});

test('scoreLead throws after repeated INVALID_OUTPUT', async () => {
  const alwaysBadProvider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'a' };
    },
    async scoreLead() {
      throw new AiError('INVALID_OUTPUT', 'always malformed');
    },
  };
  const service = createService(alwaysBadProvider, {});
  await assert.rejects(
    () => service.scoreLead({}),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('scoreLead maps a non-numeric provider score to INVALID_OUTPUT', async () => {
  const badProvider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'a' };
    },
    async scoreLead() {
      return { score: 'high' };
    },
  };
  const service = createService(badProvider, {});
  await assert.rejects(
    () => service.scoreLead({}),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('scoreLead includes an optional provider summary', async () => {
  const provider = {
    async generateContent() {
      return { title: 't', description: 'd' };
    },
    async answerQuestion() {
      return { answer: 'a' };
    },
    async scoreLead() {
      return { score: 80, summary: ' high intent ' };
    },
  };
  const service = createService(provider, {});
  const result = await service.scoreLead({});
  assert.equal(result.score, 80);
  assert.equal(result.summary, 'high intent');
  assert.ok(Object.isFrozen(result));
});

test('scoreLead returns an immutable result', async () => {
  const service = createService(createMockProvider(), {});
  const result = await service.scoreLead({});
  assert.ok(Object.isFrozen(result));
});
