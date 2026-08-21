'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAiConfig } = require('../../src/config');
const { AiError } = require('../../src/errors');

function configMissing(fn) {
  assert.throws(fn, (e) => e instanceof AiError && e.code === 'CONFIG_MISSING');
}

test('defaults to mock mode when no env is provided', () => {
  const cfg = loadAiConfig({});
  assert.equal(cfg.mode, 'mock');
  assert.equal(cfg.apiKey, undefined);
  assert.equal(cfg.baseUrl, undefined);
  assert.equal(cfg.model, 'gpt-4o-mini');
  assert.equal(cfg.timeoutMs, 30000);
  assert.equal(cfg.maxTokens, 800);
  assert.equal(cfg.maxTitleLength, 120);
  assert.equal(cfg.maxDescriptionLength, 1000);
  assert.equal(cfg.maxQuestionLength, 500);
  assert.equal(cfg.maxAnswerLength, 1000);
  assert.equal(cfg.chatRateLimit, 20);
  assert.equal(cfg.chatRateWindowMs, 60000);
});

test('explicit mock mode requires no API key', () => {
  const cfg = loadAiConfig({ AI_MODE: 'mock' });
  assert.equal(cfg.mode, 'mock');
  assert.equal(cfg.apiKey, undefined);
});

test('live mode without an API key throws CONFIG_MISSING', () => {
  configMissing(() => loadAiConfig({ AI_MODE: 'live' }));
  configMissing(() => loadAiConfig({ AI_MODE: 'live', AI_API_KEY: '   ' }));
});

test('live mode with an API key loads (mode is case-insensitive)', () => {
  const cfg = loadAiConfig({ AI_MODE: 'LIVE', AI_API_KEY: 'sk-test-123' });
  assert.equal(cfg.mode, 'live');
  assert.equal(cfg.apiKey, 'sk-test-123');
});

test('invalid AI_MODE throws CONFIG_MISSING', () => {
  configMissing(() => loadAiConfig({ AI_MODE: 'bogus' }));
});

test('parses positive integer env values and trims strings', () => {
  const cfg = loadAiConfig({
    AI_MODE: 'mock',
    AI_TIMEOUT_MS: '5000',
    AI_MAX_TITLE_LENGTH: '80',
    AI_MODEL: '  gpt-4o  ',
    AI_BASE_URL: 'https://example.com/v1/',
  });
  assert.equal(cfg.timeoutMs, 5000);
  assert.equal(cfg.maxTitleLength, 80);
  assert.equal(cfg.model, 'gpt-4o');
  assert.equal(cfg.baseUrl, 'https://example.com/v1/');
});

test('invalid or non-positive numeric values throw CONFIG_MISSING', () => {
  configMissing(() => loadAiConfig({ AI_MODE: 'mock', AI_TIMEOUT_MS: 'abc' }));
  configMissing(() => loadAiConfig({ AI_MODE: 'mock', AI_TIMEOUT_MS: '0' }));
  configMissing(() => loadAiConfig({ AI_MODE: 'mock', AI_TIMEOUT_MS: '-5' }));
  configMissing(() => loadAiConfig({ AI_MODE: 'mock', AI_MAX_TOKENS: '12.5' }));
});

test('empty string values fall back to defaults', () => {
  const cfg = loadAiConfig({ AI_MODE: '', AI_MODEL: '', AI_BASE_URL: '', AI_TIMEOUT_MS: '' });
  assert.equal(cfg.mode, 'mock');
  assert.equal(cfg.model, 'gpt-4o-mini');
  assert.equal(cfg.baseUrl, undefined);
  assert.equal(cfg.timeoutMs, 30000);
});

test('returns a frozen config object', () => {
  const cfg = loadAiConfig({});
  assert.ok(Object.isFrozen(cfg));
});
