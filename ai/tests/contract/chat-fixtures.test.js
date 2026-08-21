'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createAiService } = require('../../src/index');

const FIXTURES_PATH = join(__dirname, '..', '..', 'test-fixtures', 'chat.json');
const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'));

const ALLOWED_PROPERTY_FIELDS = new Set([
  'propertyId',
  'title',
  'description',
  'propertyType',
  'price',
  'location',
  'bedrooms',
  'bathrooms',
  'amenities',
  'furnished',
  'availability',
  'status',
]);

test('chat fixtures: file exposes meta and a non-empty cases array', () => {
  assert.equal(typeof fixtures.meta.purpose, 'string');
  assert.ok(Array.isArray(fixtures.cases));
  assert.ok(fixtures.cases.length > 0, 'at least one fixture case is required');
});

test('chat fixtures: properties use only shared README PropertyContext field names', () => {
  for (const fixture of fixtures.cases) {
    assert.equal(typeof fixture.question, 'string', `fixture "${fixture.name}" requires a question`);
    assert.ok(fixture.question.trim().length > 0, `fixture "${fixture.name}" question must be non-empty`);
    assert.ok(fixture.propertyId === undefined, `fixture "${fixture.name}" should nest context under "property"`);
    for (const key of Object.keys(fixture.property)) {
      assert.ok(
        ALLOWED_PROPERTY_FIELDS.has(key),
        `fixture "${fixture.name}" uses invented property field "${key}" (shared field names must stay frozen)`
      );
    }
  }
});

for (const fixture of fixtures.cases) {
  test(`chat fixtures: "${fixture.name}" matches the mock facade exactly`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const { answer } = await service.answerQuestion(fixture.property, fixture.question);
    assert.deepEqual({ answer }, fixture.expectedOutput);
  });

  test(`chat fixtures: "${fixture.name}" output honors the facade shape contract`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const result = await service.answerQuestion(fixture.property, fixture.question);

    assert.deepEqual(Object.keys(result), ['answer']);
    assert.equal(typeof result.answer, 'string');
    assert.ok(result.answer.trim().length > 0, 'answer must be non-empty');
    assert.equal(result.answer, result.answer.trim(), 'answer must be trimmed');
    assert.ok(result.answer.trim().length <= 1000, 'answer must not exceed the 1000-char cap');
  });
}

test('chat fixtures: facade does not mutate the property context or question (stateless)', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  for (const fixture of fixtures.cases) {
    const propertyBefore = JSON.stringify(fixture.property);
    const questionBefore = fixture.question;
    await service.answerQuestion(fixture.property, fixture.question);
    assert.equal(JSON.stringify(fixture.property), propertyBefore, `fixture "${fixture.name}" must not mutate the property`);
    assert.equal(fixture.question, questionBefore, `fixture "${fixture.name}" must not mutate the question`);
  }
});

test('chat fixtures: mock facade is deterministic per fixture', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  for (const fixture of fixtures.cases) {
    const first = await service.answerQuestion(fixture.property, fixture.question);
    const second = await service.answerQuestion(fixture.property, fixture.question);
    assert.deepEqual(first, second, `fixture "${fixture.name}" must be deterministic in mock mode`);
  }
});
