'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createAiService } = require('../../src/index');

const FIXTURES_PATH = join(__dirname, '..', '..', 'test-fixtures', 'lead-score.json');
const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'));

const ALLOWED_CONTEXT_FIELDS = new Set([
  'userName',
  'userPhone',
  'message',
  'date',
  'time',
  'favoritesCount',
  'priorViewingCount',
  'propertyTitle',
  'propertyPrice',
]);

test('lead-score fixtures: file exposes meta and a non-empty cases array', () => {
  assert.equal(typeof fixtures.meta.purpose, 'string');
  assert.ok(Array.isArray(fixtures.cases));
  assert.ok(fixtures.cases.length > 0, 'at least one fixture case is required');
});

test('lead-score fixtures: contexts use only the agreed LeadContext signal fields', () => {
  for (const fixture of fixtures.cases) {
    for (const key of Object.keys(fixture.context)) {
      assert.ok(
        ALLOWED_CONTEXT_FIELDS.has(key),
        `fixture "${fixture.name}" uses invented lead field "${key}" (shared field names must stay frozen)`
      );
    }
  }
});

test('lead-score fixtures: no phone numbers included (PII minimization)', () => {
  for (const fixture of fixtures.cases) {
    assert.equal(fixture.context.userPhone, undefined, `fixture "${fixture.name}" must not include a phone number`);
  }
});

for (const fixture of fixtures.cases) {
  test(`lead-score fixtures: "${fixture.name}" matches the mock facade exactly`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const result = await service.scoreLead(fixture.context);
    assert.deepEqual(result, fixture.expectedOutput);
  });

  test(`lead-score fixtures: "${fixture.name}" output honors the facade shape contract`, async () => {
    const service = createAiService({ AI_MODE: 'mock' });
    const result = await service.scoreLead(fixture.context);

    assert.deepEqual(Object.keys(result), ['score'], 'expected output must be exactly { score }');
    assert.ok(Number.isInteger(result.score), `score must be an integer, got ${result.score}`);
    assert.ok(result.score >= 0 && result.score <= 100, `score must be within 0-100, got ${result.score}`);
  });
}

test('lead-score fixtures: mock facade is deterministic per fixture', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  for (const fixture of fixtures.cases) {
    const first = await service.scoreLead(fixture.context);
    const second = await service.scoreLead(fixture.context);
    assert.deepEqual(first, second, `fixture "${fixture.name}" must be deterministic in mock mode`);
  }
});
