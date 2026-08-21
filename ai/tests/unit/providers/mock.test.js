'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMockProvider } = require('../../../src/providers/mock');
const { PROVIDER_METHODS, assertProviderShape } = require('../../../src/providers/provider');

const FULL_RAW = {
  propertyType: 'apartment',
  price: 50000,
  location: 'DHA Karachi',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'wifi'],
  furnished: true,
  notes: 'Near the main boulevard on a quiet street.',
};

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

test('mock provider implements the full provider interface', () => {
  const provider = createMockProvider();
  assertProviderShape(provider);
  for (const method of PROVIDER_METHODS) {
    assert.equal(typeof provider[method], 'function');
  }
});

test('generateContent is deterministic', async () => {
  const provider = createMockProvider();
  const first = await provider.generateContent(FULL_RAW);
  const second = await provider.generateContent(FULL_RAW);
  assert.deepEqual(first, second);
});

test('generateContent builds a title from the raw property fields', async () => {
  const provider = createMockProvider();
  const { title } = await provider.generateContent(FULL_RAW);
  assert.ok(title.includes('2-Bedroom'), `title should mention bedrooms, got: ${title}`);
  assert.ok(title.toLowerCase().includes('apartment'), `title should mention property type, got: ${title}`);
  assert.ok(title.toLowerCase().includes('dha karachi'), `title should mention location, got: ${title}`);
});

test('generateContent builds a description mentioning amenities, price, and furnishings', async () => {
  const provider = createMockProvider();
  const { description } = await provider.generateContent(FULL_RAW);
  assert.ok(description.includes('parking, wifi'), `description should list amenities: ${description}`);
  assert.ok(description.includes('50,000'), `description should mention price: ${description}`);
  assert.ok(description.toLowerCase().includes('furnished'), `description should mention furnished: ${description}`);
  assert.ok(description.includes('boulevard'), `description should include notes: ${description}`);
});

test('generateContent returns non-empty output for minimal input', async () => {
  const provider = createMockProvider();
  const { title, description } = await provider.generateContent({});
  assert.ok(title.length > 0);
  assert.ok(description.length > 0);
});

test('generateContent ignores unknown fields (shared field names only)', async () => {
  const provider = createMockProvider();
  const { title } = await provider.generateContent({ inventedField: 'x', price: 100 });
  assert.equal(title.toLowerCase().includes('inventedfield'), false);
  assert.ok(title.length > 0);
});

test('answerQuestion answers price questions from property context', async () => {
  const provider = createMockProvider();
  const { answer } = await provider.answerQuestion(FULL_PROPERTY, 'How much is the monthly rent?');
  assert.ok(answer.includes('50,000'), `expected price in answer, got: ${answer}`);
});

test('answerQuestion is case-insensitive', async () => {
  const provider = createMockProvider();
  const { answer } = await provider.answerQuestion(FULL_PROPERTY, 'WHAT IS THE PRICE');
  assert.ok(answer.includes('50,000'));
});

test('answerQuestion answers bedroom and furnished questions', async () => {
  const provider = createMockProvider();
  const beds = await provider.answerQuestion(FULL_PROPERTY, 'How many bedrooms?');
  assert.ok(beds.answer.includes('2'));
  const furn = await provider.answerQuestion(FULL_PROPERTY, 'Is it furnished?');
  assert.ok(furn.answer.toLowerCase().includes('furnished'));
});

test('answerQuestion answers location and amenities questions', async () => {
  const provider = createMockProvider();
  const loc = await provider.answerQuestion(FULL_PROPERTY, 'Where is this located?');
  assert.ok(loc.answer.toLowerCase().includes('dha karachi'));
  const am = await provider.answerQuestion(FULL_PROPERTY, 'What amenities are available?');
  assert.ok(am.answer.toLowerCase().includes('wifi'));
});

test('answerQuestion returns a generic property-based fallback for unknown questions', async () => {
  const provider = createMockProvider();
  const { answer } = await provider.answerQuestion(FULL_PROPERTY, 'Who is the owner?');
  assert.ok(answer.length > 0);
  assert.ok(answer.toLowerCase().includes('listing'));
});

test('answerQuestion handles an empty question gracefully', async () => {
  const provider = createMockProvider();
  const { answer } = await provider.answerQuestion(FULL_PROPERTY, '');
  assert.ok(answer.length > 0);
});

test('scoreLead returns 20 for an empty context', async () => {
  const provider = createMockProvider();
  const { score } = await provider.scoreLead({});
  assert.equal(score, 20);
});

test('scoreLead returns a high score for a rich context', async () => {
  const provider = createMockProvider();
  const { score } = await provider.scoreLead({
    userName: 'Ali',
    message: 'I am very interested in this apartment and would like to schedule a visit.',
    date: '2026-08-20',
    time: '17:00',
    favoritesCount: 4,
    priorViewingCount: 2,
  });
  assert.ok(Number.isInteger(score), 'score must be an integer');
  assert.ok(score >= 80 && score <= 100, `expected high score in 80-100, got ${score}`);
});

test('scoreLead clamps to 100 for excessive signals', async () => {
  const provider = createMockProvider();
  const { score } = await provider.scoreLead({
    userName: 'Ali',
    message: 'Very interested, please call me as soon as possible about this apartment.',
    date: '2026-08-20',
    time: '17:00',
    favoritesCount: 99,
    priorViewingCount: 99,
  });
  assert.equal(score, 100);
});
