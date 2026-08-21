'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createAiService } = require('../../src/index');

const FIXTURES_PATH = join(__dirname, '..', '..', 'test-fixtures', 'generate-content.json');
const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'));

const ALLOWED_RAW_FIELDS = new Set([
  'propertyType',
  'price',
  'location',
  'bedrooms',
  'bathrooms',
  'amenities',
  'furnished',
  'notes',
]);

test('generate-content fixtures: file exposes meta and a non-empty cases array', () => {
  assert.equal(typeof fixtures.meta.purpose, 'string');
  assert.ok(Array.isArray(fixtures.cases));
  assert.ok(fixtures.cases.length > 0, 'at least one fixture case is required');
});

test('generate-content fixtures: inputs use only shared README property field names', () => {
  for (const fixture of fixtures.cases) {
    for (const key of Object.keys(fixture.input)) {
      assert.ok(
        ALLOWED_RAW_FIELDS.has(key),
        `fixture "${fixture.name}" uses invented field "${key}" (shared field names must stay frozen)`
      );
    }
  }
});

for (const fixture of fixtures.cases) {
  test(`generate-content fixtures: "${fixture.name}" matches the mock facade exactly`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const content = await service.generateContent(fixture.input);
    assert.deepEqual(content, fixture.expectedOutput);
  });

  test(`generate-content fixtures: "${fixture.name}" output honors the facade shape contract`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const content = await service.generateContent(fixture.input);

    assert.deepEqual(Object.keys(content).sort(), ['description', 'title']);
    assert.equal(typeof content.title, 'string');
    assert.ok(content.title.trim().length > 0, 'title must be non-empty');
    assert.ok(content.title.trim().length <= 120, 'title must not exceed the 120-char cap');
    assert.equal(typeof content.description, 'string');
    assert.ok(content.description.trim().length > 0, 'description must be non-empty');
    assert.ok(content.description.trim().length <= 1000, 'description must not exceed the 1000-char cap');
  });
}

test('generate-content fixtures: mock facade is deterministic per fixture', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  for (const fixture of fixtures.cases) {
    const first = await service.generateContent(fixture.input);
    const second = await service.generateContent(fixture.input);
    assert.deepEqual(first, second, `fixture "${fixture.name}" must be deterministic in mock mode`);
  }
});
