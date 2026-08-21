'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAiService } = require('../../src/index');
const { loadAiConfig } = require('../../src/config');
const { isAiError } = require('../../src/errors');

test('createAiService with an empty env defaults to mock mode', async () => {
  const service = createAiService({});
  assert.equal(typeof service.generateContent, 'function');
  const content = await service.generateContent({ location: 'Gulberg', bedrooms: 1 });
  assert.ok(content.title.includes('Gulberg'));
});

test('createAiService selects the mock provider for explicit mock mode', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  const content = await service.generateContent({ propertyType: 'apartment' });
  assert.ok(content.title.length > 0);
});

test('createAiService in live mode builds a service without making network calls', () => {
  const service = createAiService({ AI_MODE: 'live', AI_API_KEY: 'sk-test' });
  assert.equal(typeof service.generateContent, 'function');
});

test('createAiService in live mode without an API key throws CONFIG_MISSING', () => {
  assert.throws(
    () => createAiService({ AI_MODE: 'live' }),
    (e) => isAiError(e) && e.code === 'CONFIG_MISSING'
  );
});

test('createAiService accepts a resolved config object', async () => {
  const config = loadAiConfig({ AI_MODE: 'mock' });
  const service = createAiService(config);
  const content = await service.generateContent({ location: 'Clifton' });
  assert.ok(content.title.includes('Clifton'));
});

test('createAiService rejects an invalid AI_MODE', () => {
  assert.throws(
    () => createAiService({ AI_MODE: 'bogus' }),
    (e) => isAiError(e) && e.code === 'CONFIG_MISSING'
  );
});
